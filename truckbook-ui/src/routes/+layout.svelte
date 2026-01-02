<script>
	import './layout.css';
	import favicon from '$lib/assets/truckbookicon.png';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/png" sizes="32x32" href={favicon} />
	<link rel="icon" type="image/png" sizes="16x16" href={favicon} />
	<link rel="apple-touch-icon" sizes="180x180" href={favicon} />
</svelte:head>
{@render children()}
