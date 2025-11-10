'use strict';

define('admin/plugins/stripe-subscriptions', ['settings'], function (Settings) {

	var ACP = {};

	ACP.init = function () {
		Settings.load('stripe-subscriptions', $('.stripe-subscriptions-settings'));

		$('#save').on('click', function () {
			Settings.save('stripe-subscriptions', $('.stripe-subscriptions-settings'));
		});
	};

	return ACP;
});