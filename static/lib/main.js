'use strict';


$('document').ready(function () {
	$(window).on('action:ajaxify.end', function () {
		if (ajaxify.currentPage.match('user/')) {
			app.require('forum/subscribe').then(function (subscribe) {
				subscribe.handleCancelButton();
			});
		}
	});
});