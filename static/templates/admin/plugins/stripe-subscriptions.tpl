<div class="acp-page-container">
	<!-- IMPORT admin/partials/settings/header.tpl -->

	<div class="row m-0">
		<div id="spy-container" class="col-12 col-md-8 px-0 mb-4" tabindex="0">
			<form role="form" class="stripe-subscriptions-settings">
				<div class="mb-4">
					<h5 class="fw-bold tracking-tight settings-header">Stripe API Connection</h5>
					<p class="lead">
						Visit <a href="https://stripe.com">Stripe</a> to set up a new account.
					</p>

					<div class="mb-3">
						<label class="form-label" for="api_key">API Key</label>
						<input type="password" id="api_key" name="api_key" title="API Key" class="form-control" placeholder="sk_XXXXXXX">
					</div>

					<div class="mb-3">
						<label class="form-label" for="api_key">Publishable Key</label>
						<input type="text" id="publish_key" name="publish_key" title="Publishable Key" class="form-control" placeholder="pk_XXXXXXX">
					</div>
				</div>

				<div class="mb-4">
					<h5 class="fw-bold tracking-tight settings-header">Subscription Data</h5>
					<div class="mb-3">
						<label class="form-label" for="product_id">Stripe Product ID</label>
						<input type="text" id="product_id" name="product_id" class="form-control" placeholder="prod_xxxxxxx">
					</div>
					<div class="mb-3">
						<label class="form-label" for="name">Membership Name</label>
						<input type="text" id="name" name="name" title="Membership Name" class="form-control" placeholder="Insider">
					</div>

					<div class="mb-3">
						<label class="form-label" for="company_name">Company Name</label>
						<input type="text" id="company_name" name="company_name" title="Company Name" class="form-control" placeholder="Company Name">
					</div>

					<div class="mb-3">
						<label class="form-label" for="sales_tax_rate">Sales Tax Rate (optional %)</label>
						<input type="text" id="sales_tax_rate" name="sales_tax_rate" title="Sales Tax Rate" class="form-control" placeholder="8.25">
					</div>

					<div class="mb-3">
						<label class="form-label" for="sales_tax_stateate">Sales Tax State (Abbr)</label>
						<input type="text" id="sales_tax_state" name="sales_tax_state" title="Sales Tax State" class="form-control" placeholder="TX">
					</div>
				</div>

				<div class="mb-4">
					<h5 class="fw-bold tracking-tight settings-header">Premium Group</h5>
					<div class="mb-3">
						<label class="form-label" for="premium-group">Add premium members to this group:</label>
						<select name="premium-group" id="premium-group" class="form-select">
							{{{ each groups }}}
							<option value="{groups.displayName}">{groups.displayName}</option>
							{{{ end }}}
						</select>
					</div>
				</div>
			</form>
		</div>
	</div>
</div>

