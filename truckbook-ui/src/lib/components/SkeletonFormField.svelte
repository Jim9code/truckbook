<script>
	export let label = true;
</script>

<div class="space-y-2">
	{#if label}
		<div class="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
	{/if}
	<div class="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
</div>

