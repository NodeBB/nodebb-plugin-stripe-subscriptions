'use strict';

const winston = require.main.require('winston');

const db = require.main.require('./src/database');
const meta = require.main.require('./src/meta');
const groups = require.main.require('./src/groups');
const user = require.main.require('./src/user');
const controllerHelpers = require.main.require('./src/controllers/helpers');

let API;

const stripe = module.exports;

stripe.configure = async function () {
	const settings = await meta.settings.get('stripe-subscriptions');
	if (!settings.api_key) {
		return winston.warn('[stripe-subscriptions] API Credentials not configured');
	}

	API = require('stripe')(settings.api_key);
};

stripe.listProducts = async function () {
	const products = await API.products.list({ limit: 10 });
	await Promise.all(products.data.map(async (product) => {
		const prices = await API.prices.list({
			product: product.id,
			limit: 10,
		});
		if (prices.data && prices.data.length > 0) {
			product.prices = prices.data;
		}
	}));
	return products.data;
};

function formatAmount(amount, currency = 'usd') {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
	}).format(amount / 100);
};

stripe.getProduct = async function (productId) {
	const product = await API.products.retrieve(productId);
	const prices = await API.prices.list({
		product: product.id,
		limit: 10,
	});
	if (prices.data && prices.data.length > 0) {
		product.prices = prices.data.map((price) => {
			price.display_price = formatAmount(price.unit_amount, price.currency);
			return price;
		});
	}
	return product;
};

stripe.isSubscribed = async function (uid) {
	return await db.isSortedSetMember('stripe-subscriptions:subscribed', uid);
};

stripe.onSubscribe = async function (req, res) {
	if (!req.user) {
		return controllerHelpers.notAllowed(req, res);
	}
	const { uid } = req;
	const { token_id, email, price_id } = req.body;

	if (!token_id) {
		winston.warn('[stripe] Invalid Token' + token_id);
		return res.redirect('/?subscribe=fail');
	}

	if(!email) {
		winston.warn('[stripe] Invalid Email');
		return res.redirect('/?subscribe=fail');
	}

	let token = null;
	try {
		token = await API.tokens.retrieve(token_id);
	} catch (err) {
		winston.warn('[stripe] Token eror for id ' + token_id + ' : ' + err);
		return res.redirect('/?subscribe=fail');
	}

	const settings = await meta.settings.get('stripe-subscriptions');
	let tax_rate = null;

	if (settings.sales_tax_rate) {
		if(!token.card) {
			winston.warn('[stripe] Card not set in token');
			return res.redirect('/?subscribe=fail');
		}
		tax_rate = settings.sales_tax_state && settings.sales_tax_state === token.card.address_state ?
			+(settings.sales_tax_rate) :
			null;
	}

	try {
		const customer = await API.customers.create({
			email,
			source: token_id,
		});

		const subscrip = {
			customer: customer.id,
			items: [{ price: price_id }],
		};
		if (tax_rate) {
			subscrip.tax_percent = tax_rate;
		}
		const subscription = await API.subscriptions.create(subscrip);
		await db.sortedSetAdd('stripe-subscriptions:subscribed', Date.now(), uid);
		await user.setUserFields(uid, {
			'stripe-subscriptions:cid': customer.id,
			'stripe-subscriptions:sid': subscription.id,
		});

		if (settings['premium-group']) {
			await groups.join(settings['premium-group'], uid);
		}

		winston.info(`[stripe Succcessfully created a subscription for uid ${uid} for  customer: ${customer.id} and subscription ${subscription.id}`);
		res.redirect('/?subscribe=success');
	} catch (err) {
		winston.warn('[stripe] Customer creation error: ' + err);
		return res.redirect('/?subscribe=fail');
	}
};

stripe.cancelSubscription = async function (req, res) {
	if (!req.user) {
		return controllerHelpers.notAllowed(req, res);
	}

	const { uid } = req.uid;
	try {
		const userData = await user.getUserFields(uid, ['stripe-subscriptions:sid']);
		const sid = userData['stripe-subscriptions:sid'];
		if (!sid) {
			winston.info('[stripe] Attempted to cancel subscription for uid ' + uid + ' but user does not have a Sub ID:' + JSON.stringify(userData));
			return res.redirect('/?subscribe=cancel-fail');
		}

		const settings = await meta.settings.get('stripe-subscriptions');
		await API.subscriptions.del(sid);

		await db.deleteObjectField('user:' + uid, 'stripe-subscriptions:sid');
		await db.sortedSetRemove('stripe-subscriptions:subscribed', uid);
		if (settings['premium-group']) {
			await groups.leave(settings['premium-group'], uid);
		}
		res.redirect('/?subscribe=cancel-success');
	} catch (err) {
		winston.error(`[stripe] Attempted to cancel subscription for uid ${uid} because ${err.stack}`);
		return res.redirect('/?subscribe=cancel-fail');
	}
};

