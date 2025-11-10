'use strict';

/* globals StripeCheckout */

define('subscribe', ['alerts'], function (alerts) {

	const subscribe = {};

	let price_id = null;

	subscribe.init = function () {
		if (typeof StripeCheckout === 'undefined') {
			return setTimeout(subscribe.init, 100);
		}
		const handler = StripeCheckout.configure({
			key: ajaxify.data.publish_key,
			image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
			locale: 'auto',
			token: function (token) {
				// You can access the token ID with `token.id`.
				// Get the token ID to your server-side code for use.
				$.post('/subscribe', {
					email: ajaxify.data.email,
					price_id: price_id,
					token_id: token.id,
					csrf_token: config.csrf_token,
				}).done(function (response) {
					alerts.success(response.code);
					ajaxify.go('/');
				}).fail(function (err) {
					alerts.error(err.responseJSON.code);
				});
			},
		});

		$('[data-price-id]').on('click', function () {
			price_id = $(this).attr('data-price-id');
			// Open Checkout with further options:
			handler.open({
				name: ajaxify.data.company_name,
				description: `${ajaxify.data.name} Subscription`,
				email: ajaxify.data.email,
				zipCode: true,
				billingAddress: true,
				amount: parseInt($(this).attr('data-price-amount'), 10),
			});
			return false;
		});

		// Close Checkout on page navigation:
		window.addEventListener('popstate', function () {
			handler.close();
		});
	};

	subscribe.handleCancelButton = function () {
		$('#btn-cancel-subscription').on('click', async function () {
			const bootbox = await app.require('bootbox');
			bootbox.confirm('Are you sure you want to end your subscription? You will not be able to access member-only content anymore.', async function (confirm) {
				if (confirm) {
					const alerts = await app.require('alerts');
					$.post('/stripe-subscriptions/cancel-subscription', {
						csrf_token: config.csrf_token,
					}).done(function (response) {
						alerts.success(codeToMessage(response.code));
						ajaxify.go('/');
					}).fail(function (err) {
						alerts.error(codeToMessage(err.responseJSON.code));
					});
				}
			});
		});
	};

	function codeToMessage(code) {
		switch (code) {
			case 'success': return 'You have successfully subscribed to our forum.';
			case 'fail': return 'We were unable to process your subscription - you have not been charged.';
			case 'already-subscribed': return 'You are already subscribed to our forum.';
			case 'cancel-success': return 'We have successfully cancelled your subscription.';
			case 'cancel-fail': return 'We were unable to cancel your subscription. Please contact an administrator.';
			default: return 'An unknown error occurred.';
		}
	}

	return subscribe;
});