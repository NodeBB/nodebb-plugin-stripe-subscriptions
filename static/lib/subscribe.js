'use strict';

/* globals StripeCheckout */

define('subscribe', [], function () {

	const subscribe = {};

	subscribe.init = function () {
		const handler = StripeCheckout.configure({
			key: ajaxify.data.publish_key,
			image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
			locale: 'auto',
			token: function (token) {
				// You can access the token ID with `token.id`.
				// Get the token ID to your server-side code for use.
				document.getElementById('stripeToken').value = token.id;
				document.getElementById('stripePOSTForm').submit();
			},
		});

		$('[data-price-id]').on('click', function () {
			$('#price_id').val($(this).attr('data-price-id'));
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

	return subscribe;
});