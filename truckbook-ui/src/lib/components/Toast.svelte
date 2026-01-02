<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	export let message = '';
	export let type = 'success'; // 'success' | 'error' | 'info'
	export let duration = 5000; // Auto-dismiss after 5 seconds
	export let show = false;

	let timeoutId;

	$: if (show && duration > 0) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			show = false;
		}, duration);
	}

	function close() {
		show = false;
		clearTimeout(timeoutId);
	}

	onMount(() => {
		return () => clearTimeout(timeoutId);
	});
</script>

{#if show}
	<div
		class="fixed top-4 right-4 z-50 max-w-md w-full animate-slide-in"
		role="alert"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="flex items-start gap-3 p-4 rounded-lg shadow-lg border {type === 'success'
				? 'bg-green-50 border-green-200'
				: type === 'error'
					? 'bg-red-50 border-red-200'
					: 'bg-blue-50 border-blue-200'}"
		>
			<!-- Icon -->
			<div
				class="flex-shrink-0 {type === 'success'
					? 'text-green-600'
					: type === 'error'
						? 'text-red-600'
						: 'text-blue-600'}"
			>
				{#if type === 'success'}
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
				{:else if type === 'error'}
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				{:else}
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				{/if}
			</div>

			<!-- Message -->
			<div class="flex-1">
				<p
					class="text-sm font-medium {type === 'success'
						? 'text-green-800'
						: type === 'error'
							? 'text-red-800'
							: 'text-blue-800'}"
				>
					{message}
				</p>
			</div>

			<!-- Close Button -->
			<button
				on:click={close}
				class="flex-shrink-0 {type === 'success'
					? 'text-green-600 hover:text-green-800'
					: type === 'error'
						? 'text-red-600 hover:text-red-800'
						: 'text-blue-600 hover:text-blue-800'}"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
	</div>
{/if}

<style>
	@keyframes slide-in {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.animate-slide-in {
		animation: slide-in 0.3s ease-out;
	}
</style>

