{{{ if  notsetup }}}
<div class="alert alert-danger" role="alert">
	<span class="fa fa-exclamation-circle"></span>
	The subscription module has not been properly set-up. Please consult your administrator.
</div>
{{{ else }}}
<div class="alert alert-info" role="alert">
	<span class="fa fa-lock"></span>
	In order to gain full access to this forum, you'll need to sign up for a subscription plan.
</div>

<div class="row">
	<div class="col-sm-12 col-md-6">
		<div class="well">
			<script src="https://checkout.stripe.com/checkout.js"></script>

			<h1 style="text-transform:capitalize">{subscription_title}</h1>

			<div>
				{description}
			</p>

			<div class="d-flex gap-3">
			{{{ each product.prices}}}
				<button class="btn btn-primary btn-block price-button text-nowrap" data-price-id="{product.prices.id}" data-price-amount="{product.prices.unit_amount}">Subscribe for {product.prices.display_price} {product.prices.currency}/{product.prices.recurring.interval}</button>
			{{{ end }}}
			</div>
		</div>
	</div>
</div>
{{{ end }}}
