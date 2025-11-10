'use strict';

const validator = require.main.require('validator');
const winston = require.main.require('winston');
const db = require.main.require('./src/database');
const groups = require.main.require('./src/groups');
const user = require.main.require('./src/user');
const meta = require.main.require('./src/meta');
const plugins = require.main.require('./src/plugins');
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
		controllerHelpers.redirect(res, '/?subscribed=already-subscribed');
		return;
	}

	const userData = await user.getUserFields(uid, ['email']);
	if (!userData || !userData.email) {
		winston.info('[stripe] Could not find email for user:' + uid);
		controllerHelpers.redirect(res, '/?subscribed=fail');
		return;
	}

	const settings = await meta.settings.get('stripe-subscriptions');
	const name = settings.name ? settings.name : 'Insider';
	const title = settings.title ? settings.title : 'Become an Insider';
	const default_description = `Sign up for unlimited access to all **${name}** forums.

				Get early access to all new content we create.

				Includes an all-access pass to communicate with our staff of writers.`;

	const description = await plugins.hooks.fire('filter:parse.raw',
		settings.description ?
			settings.description :
			default_description);

	const product = await stripe.getProduct(settings.product_id);

	res.render('subscribe', {
		product,
		company_name: settings.company_name,
		publish_key: settings.publish_key,
		notsetup: !settings.api_key || !settings.publish_key,
		title: 'Members Only Section',
		email: userData.email,
		name: name,
		subscription_title: title,
		description,
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