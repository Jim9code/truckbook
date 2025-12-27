<script>
	import { goto } from '$app/navigation';
	import { api, setToken } from '$lib/api.js';

	let companyName = '';
	let fullName = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let showPassword = false;
	let showConfirmPassword = false;
	let agreeToTerms = false;
	let errors = {};
	let isLoading = false;

	function validateForm() {
		errors = {};
		
		if (!companyName.trim()) {
			errors.companyName = 'Company name is required';
		}
		
		if (!fullName.trim()) {
			errors.fullName = 'Full name is required';
		}
		
		if (!email.trim()) {
			errors.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			errors.email = 'Please enter a valid email address';
		}
		
		if (!password) {
			errors.password = 'Password is required';
		} else if (password.length < 8) {
			errors.password = 'Password must be at least 8 characters';
		}
		
		if (!confirmPassword) {
			errors.confirmPassword = 'Please confirm your password';
		} else if (password !== confirmPassword) {
			errors.confirmPassword = 'Passwords do not match';
		}
		
		if (!agreeToTerms) {
			errors.terms = 'You must agree to the Terms of Service and Privacy Policy';
		}
		
		return Object.keys(errors).length === 0;
	}

	async function handleSignup() {
		if (!validateForm()) {
			return;
		}

		isLoading = true;
		errors.submit = '';

		try {
			const response = await api.signup({
				companyName,
				fullName,
				email,
				password
			});

			if (response.success && response.data.token) {
				// Store token
				setToken(response.data.token);
				
				// Redirect to email verification page
				goto(`/verify-email?email=${encodeURIComponent(email)}`);
			}
		} catch (error) {
			console.error('Signup error:', error);
			errors.submit = error.message || 'An error occurred. Please try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
	<div class="w-full max-w-md">
		<!-- Logo and App Name -->
		<div class="text-center mb-8">
			<div class="flex items-center justify-center gap-2 mb-2">
				<div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
					<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
						<path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
						<path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
					</svg>
				</div>
				<h1 class="text-2xl font-bold text-black">TruckBooks</h1>
			</div>
		</div>

		<!-- Form Card -->
		<div class="bg-white rounded-lg shadow-sm p-8">
			<h2 class="text-2xl font-bold text-black mb-2">Create your account</h2>
			<p class="text-gray-500 text-sm mb-6">Manage your fleet's finances in one place.</p>

			{#if errors.submit}
				<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
					{errors.submit}
				</div>
			{/if}

			<form on:submit|preventDefault={handleSignup} class="space-y-5">
				<!-- Company Name -->
				<div>
					<label for="companyName" class="block text-sm font-medium text-gray-700 mb-1">
						Company Name
					</label>
					<input
						type="text"
						id="companyName"
						bind:value={companyName}
						placeholder="e.g. Acme Logistics LLC"
						class="w-full px-4 py-2.5 border {errors.companyName ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
						required
					/>
					{#if errors.companyName}
						<p class="mt-1 text-sm text-red-600">{errors.companyName}</p>
					{/if}
				</div>

				<!-- Full Name -->
				<div>
					<label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">
						Full Name
					</label>
					<input
						type="text"
						id="fullName"
						bind:value={fullName}
						placeholder="e.g. John Doe"
						class="w-full px-4 py-2.5 border {errors.fullName ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
						required
					/>
					{#if errors.fullName}
						<p class="mt-1 text-sm text-red-600">{errors.fullName}</p>
					{/if}
				</div>

				<!-- Email -->
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
						Email Address
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
							</svg>
						</div>
						<input
							type="email"
							id="email"
							bind:value={email}
							placeholder="name@company.com"
							class="w-full pl-10 pr-4 py-2.5 border {errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							required
						/>
					</div>
					{#if errors.email}
						<p class="mt-1 text-sm text-red-600">{errors.email}</p>
					{/if}
				</div>

				<!-- Password -->
				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 mb-1">
						Password
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
							</svg>
						</div>
						<input
							type={showPassword ? 'text' : 'password'}
							id="password"
							bind:value={password}
							placeholder="8+ characters"
							class="w-full pl-10 pr-10 py-2.5 border {errors.password ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							required
						/>
						<button
							type="button"
							on:click={() => showPassword = !showPassword}
							class="absolute inset-y-0 right-0 pr-3 flex items-center"
						>
							<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								{#if showPassword}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
								{:else}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
								{/if}
							</svg>
						</button>
					</div>
					{#if errors.password}
						<p class="mt-1 text-sm text-red-600">{errors.password}</p>
					{/if}
				</div>

				<!-- Confirm Password -->
				<div>
					<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
						Confirm Password
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
						</div>
						<input
							type={showConfirmPassword ? 'text' : 'password'}
							id="confirmPassword"
							bind:value={confirmPassword}
							placeholder="Re-enter password"
							class="w-full pl-10 pr-10 py-2.5 border {errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							required
						/>
						<button
							type="button"
							on:click={() => showConfirmPassword = !showConfirmPassword}
							class="absolute inset-y-0 right-0 pr-3 flex items-center"
						>
							<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								{#if showConfirmPassword}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
								{:else}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
								{/if}
							</svg>
						</button>
					</div>
					{#if errors.confirmPassword}
						<p class="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
					{/if}
				</div>

				<!-- Terms Checkbox -->
				<div class="flex items-start">
					<input
						type="checkbox"
						id="terms"
						bind:checked={agreeToTerms}
						class="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
						required
					/>
					<label for="terms" class="ml-2 text-sm text-gray-700">
						I agree to the
						<a href="#" class="text-blue-600 hover:underline">Terms of Service</a>
						and
						<a href="#" class="text-blue-600 hover:underline">Privacy Policy</a>
					</label>
				</div>
				{#if errors.terms}
					<p class="text-sm text-red-600">{errors.terms}</p>
				{/if}

				<!-- Submit Button -->
				<button
					type="submit"
					disabled={isLoading}
					class="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoading ? 'Creating account...' : 'Create account'}
				</button>
			</form>

			<!-- Login Link -->
			<p class="mt-6 text-center text-sm text-gray-600">
				Already have an account?
				<a href="/login" class="text-blue-600 hover:underline font-medium">Log in</a>
			</p>
		</div>

		<!-- Copyright -->
		<p class="mt-8 text-center text-xs text-gray-500">
			© 2024 TruckBooks Inc. All rights reserved.
		</p>
	</div>
</div>

