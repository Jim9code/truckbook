<script>
	import { fade } from 'svelte/transition';
	import { slide } from 'svelte/transition';

	export let show = false;
	export let title = 'Confirm Action';
	export let message = 'Are you sure you want to proceed?';
	export let confirmText = 'Confirm';
	export let cancelText = 'Cancel';
	export let confirmClass = 'bg-blue-600 hover:bg-blue-700';
	export let onConfirm = () => {};
	export let onCancel = () => {};

	function handleConfirm() {
		onConfirm();
		show = false;
	}

	function handleCancel() {
		onCancel();
		show = false;
	}

	function handleBackdropClick(event) {
		if (event.target === event.currentTarget) {
			handleCancel();
		}
	}
</script>

{#if show}
	<div
		class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
		on:click={handleBackdropClick}
		transition:fade={{ duration: 200 }}
	>
		<div
			class="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
			on:click|stopPropagation
			transition:slide={{ duration: 200 }}
		>
			<div class="flex items-center gap-4 mb-4">
				<div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
					<svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
				</div>
				<div class="flex-1">
					<h3 class="text-lg font-semibold text-gray-900">{title}</h3>
				</div>
			</div>

			<p class="text-gray-600 mb-6 ml-16">{message}</p>

			<div class="flex gap-3 justify-end">
				<button
					type="button"
					on:click={handleCancel}
					class="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
				>
					{cancelText}
				</button>
				<button
					type="button"
					on:click={handleConfirm}
					class="px-4 py-2 {confirmClass} text-white rounded-lg font-medium transition-colors"
				>
					{confirmText}
				</button>
			</div>
		</div>
	</div>
{/if}

