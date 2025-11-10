'use strict';

const nconf = require.main.require('nconf');

const controllers = require('./lib/controllers');
const stripe = require('./lib/stripe');
const routeHelpers = require.main.require('./src/routes/helpers');

const plugin = module.exports;

plugin.init = async function (params) {
	const { router, middleware } = params;

	stripe.configure();

	routeHelpers.setupAdminPageRoute(router, '/admin/plugins/stripe-subscriptions', controllers.renderAdminPage);
	routeHelpers.setupPageRoute(router, '/subscribe', controllers.renderSubscribePage);

	router.post('/subscribe', middleware.applyCSRF, stripe.onSubscribe);
	router.post('/stripe-subscriptions/cancel-subscription', middleware.applyCSRF, stripe.cancelSubscription);
};

plugin.addAdminNavigation = function (header) {
	header.plugins.push({
		route: '/plugins/stripe-subscriptions',
		icon: 'fa-stripe',
		name: 'Stripe Subscriptions',
	});
	return header;
};

plugin.renderHeader = async function (hookData) {
	const { templateData, req } = hookData;
	const isSubscribed = await stripe.isSubscribed(req.uid);
	console.log('rendeer header, isSubscribed:', req.uid, isSubscribed);
	if (!isSubscribed) {
		templateData.navigation.push({
			route: '/subscribe',
			title: 'Get Premium Access',
			enabled: true,
			iconClass: 'fa-usd',
			textClass: 'visible-xs-inline',
			text: 'Upgrade',
		});
	}
	return hookData;
};


plugin.addSubscriptionSettings = async function (data) {
	const isSubscribed = await stripe.isSubscribed(data.uid);
	if (isSubscribed) {
		data.customSettings.push({
			title: 'Forum Subscription',
			content: '<button class="btn btn-danger" id="btn-cancel-subscription">Cancel Subscription</button><form id="cancel-subscription" method="POST" action="/stripe-subscriptions/cancel-subscription"></form>',
		});
	} else {
		data.customSettings.push({
			title: 'Forum Subscription',
			content: `<a href="${nconf.get('relative_path')}/subscribe" class="btn btn-success" id="btn-buy-subscription">Buy Subscription</a>`,
		});
	}
	return data;
};

plugin.whitelistSubscriptionId = function (hookData) {
	hookData.whitelist.push('stripe-subscriptions:sid');
	return hookData;
};

plugin.redirectToSubscribe = async function (data) {
	if (!data.req.uid || (!data.req.path.match('/topic') && !data.req.path.match('/category'))) {
		return data;
	}

	const url = nconf.get('relative_path') + '/subscribe';
	if (data.res.locals.isAPI) {
		data.res.status(308).json(url);
	} else {
		data.res.redirect(url);
	}
	return data;
};
