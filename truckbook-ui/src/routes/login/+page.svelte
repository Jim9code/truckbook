<script>
	import { goto } from '$app/navigation';
	import { api, setToken } from '$lib/api.js';

	let email = '';
	let password = '';
	let showPassword = false;
	let errors = {};
	let isLoading = false;

	function validateForm() {
		errors = {};
		
		if (!email.trim()) {
			errors.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			errors.email = 'Please enter a valid email address';
		}
		
		if (!password) {
			errors.password = 'Password is required';
		}
		
		return Object.keys(errors).length === 0;
	}

	async function handleLogin() {
		if (!validateForm()) {
			return;
		}

		isLoading = true;
		errors.submit = '';

		try {
			const response = await api.login({ email, password });

			if (response.success && response.data.token) {
				// Store token
				setToken(response.data.token);
				
				// Check subscription status and redirect accordingly
				if (response.data.subscriptionStatus === 'active') {
					goto('/trips');
				} else {
					goto('/subscription');
				}
			}
		} catch (error) {
			console.error('Login error:', error);
			errors.submit = error.message || 'Invalid email or password. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	function handleGoogleSignIn() {
		// TODO: Implement Google OAuth
		console.log('Google sign-in clicked');
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
			<p class="text-gray-500 text-sm">Manage your fleet finances efficiently.</p>
		</div>

		<!-- Form Card -->
		<div class="bg-white rounded-lg shadow-sm p-8">
			<h2 class="text-2xl font-bold text-black mb-2">Welcome back</h2>
			<p class="text-gray-500 text-sm mb-6">Please enter your details to sign in.</p>

			{#if errors.submit}
				<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
					{errors.submit}
				</div>
			{/if}

			<form on:submit|preventDefault={handleLogin} class="space-y-5">
				<!-- Email -->
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
						Email Address
					</label>
					<div class="relative">
						<input
							type="email"
							id="email"
							bind:value={email}
							placeholder="name@company.com"
							class="w-full px-4 py-2.5 pr-10 border {errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							required
						/>
						<div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
							<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
							</svg>
						</div>
					</div>
					{#if errors.email}
						<p class="mt-1 text-sm text-red-600">{errors.email}</p>
					{/if}
				</div>

				<!-- Password -->
				<div>
					<div class="flex items-center justify-between mb-1">
						<label for="password" class="block text-sm font-medium text-gray-700">
							Password
						</label>
						<a href="#" class="text-sm text-blue-600 hover:underline">Forgot password?</a>
					</div>
					<div class="relative">
						<input
							type={showPassword ? 'text' : 'password'}
							id="password"
							bind:value={password}
							placeholder="Enter your password"
							class="w-full px-4 py-2.5 pr-10 border {errors.password ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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

				<!-- Submit Button -->
				<button
					type="submit"
					disabled={isLoading}
					class="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoading ? 'Logging in...' : 'Log In'}
					{#if !isLoading}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					{/if}
				</button>
			</form>

			<!-- Separator -->
			<div class="relative my-6">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-gray-300"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="px-2 bg-white text-gray-500">OR CONTINUE WITH</span>
				</div>
			</div>

			<!-- Google Sign-in Button -->
			<button
				type="button"
				on:click={handleGoogleSignIn}
				class="w-full bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
			>
				<svg class="w-5 h-5" viewBox="0 0 24 24">
					<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
					<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
					<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
					<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
				</svg>
				Sign in with Google
			</button>

			<!-- Signup Link -->
			<p class="mt-6 text-center text-sm text-gray-600">
				Don't have an account?
				<a href="/signup" class="text-blue-600 hover:underline font-medium">Sign up</a>
			</p>
		</div>

		<!-- Copyright -->
		<p class="mt-8 text-center text-xs text-gray-500">
			© 2024 TruckBooks Inc. All rights reserved.
		</p>
	</div>
</div>

