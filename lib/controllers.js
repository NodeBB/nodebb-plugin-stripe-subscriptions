'use strict';

const validator = require.main.require('validator');
const winston = require.main.require('winston');
const db = require.main.require('./src/database');
const groups = require.main.require('./src/groups');
const user = require.main.require('./src/user');
const meta = require.main.require('./src/meta');
const controllerHelpers = require.main.require('./src/controllers/helpers');
const stripe = require('./stripe');

const Controllers = module.exports;

Controllers.renderAdminPage = async function (req, res) {
	const groups = await getGroupList();
	res.render('admin/plugins/stripe-subscriptions', {
		title: 'Stripe Subscriptions',
		groups: groups,
	});
};

Controllers.renderSubscribePage = async function (req, res) {
	if (!req.user) {
		return controllerHelpers.notAllowed(req, res);
	}

	const { uid } = req;

	const isSubscribed = await stripe.isSubscribed(uid);
	if (isSubscribed) {
		// res.redirect('/?subscribe=already-subscribed');
		controllerHelpers.redirect(res, '/?subscribed=already-subscribed');
		return;
	}

	const userData = await user.getUserFields(uid, ['email']);
	if (!userData || !userData.email) {
		winston.info('[stripe] Could not find email for user:' + uid);
		// res.redirect('/?subscribe=fail');
		controllerHelpers.redirect(res, '/?subscribed=already-subscribed');
		return;
	}

	const settings = await meta.settings.get('stripe-subscriptions');
	const name = settings.name ? settings.name : 'Insider';
	const a_vs_an = ['a','e','i','o','u','A','E','I','O','U'].indexOf(name.charAt(0)) > -1 ? 'an' : 'a';
	const tax_text = settings.sales_tax_rate && settings.sales_tax_state ?
		`You will be charged ${settings.sales_tax_rate}% if your state billing address is ${settings.sales_tax_state}` :
		'' ;

	const product = await stripe.getProduct(settings.product_id);

	res.render('subscribe', {
		product,
		company_name: settings.company_name,
		amount: (settings.monthly * 100),
		monthly: settings.monthly,
		publish_key: settings.publish_key,
		notsetup: !settings.api_key || !settings.publish_key,
		title: 'Members Only Section',
		email: userData.email,
		name: name,
		precursor: a_vs_an,
		tax_text: tax_text,
	});
};

async function getGroupList() {
	var list = [''];

	const groupData = await getGroupNames();
	groupData.forEach((group) => {
		list.push({
			name: group.name,
			value: group.name,
			displayName: validator.escape(String(group.name)),
		});
	});
	return list;
}

async function getGroupNames() {
	let groupEntries = Object.entries(await db.getObject('groupslug:groupname'));
	groupEntries = groupEntries.map(g => ({ slug: g[0], name: g[1] }));
	return groupEntries.filter(g => (
		g.name !== 'administrators' &&
		g.name !== 'registered-users' &&
		g.name !== 'verified-users' &&
		g.name !== 'unverified-users' &&
		g.name !== groups.BANNED_USERS
	)).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
}