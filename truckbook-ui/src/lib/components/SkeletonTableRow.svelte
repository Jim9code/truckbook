<script>
	export let columns = 5;
	
	// Predefined widths for variety without using Math.random()
	const widths = [70, 85, 60, 75, 90, 65, 80, 55, 95];
</script>

<tr>
	{#each Array(columns) as _, i}
		<td class="px-6 py-4 whitespace-nowrap">
			<div class="h-4 bg-gray-200 rounded animate-pulse" style="width: {widths[i % widths.length]}%"></div>
		</td>
	{/each}
</tr>

