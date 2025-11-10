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
						<label class="form-label" for="title">Title</label>
						<input type="text" id="title" name="title" title="Subscription Title" class="form-control" placeholder="Become an Insider">
					</div>

					<div class="mb-3">
						<label class="form-label" for="name">Description (Markdown)</label>
						<textarea id="description" name="description" title="Subscription Description" class="form-control" placeholder="Sign up for unlimited access to all *Insider* forums. &#10;Get early access to all new content we create. &#10;Includes an all-access pass to communicate with our staff of writers." rows="6"></textarea>
					</div>

					<div class="mb-3">
						<label class="form-label" for="name">Membership Name</label>
						<input type="text" id="name" name="name" title="Membership Name" class="form-control" placeholder="Insider">
					</div>

					<div class="mb-3">
						<label class="form-label" for="company_name">Company Name</label>
						<input type="text" id="company_name" name="company_name" title="Company Name" class="form-control" placeholder="Company Name">
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

