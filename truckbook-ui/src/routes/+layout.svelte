<script>
	import './layout.css';
	import favicon from '$lib/assets/truckbookicon.png';
	import { page } from '$app/stores';

	let { children } = $props();
	
	// Base URL for the site
	$: baseUrl = 'https://truckbooks.site';
	$: currentUrl = baseUrl + $page.url.pathname;
	
	// Logo URL - use static folder for predictable public URL
	const logoUrl = `${baseUrl}/truckbookicon.png`;
</script>

<svelte:head>
	<!-- Favicon -->
	<link rel="icon" type="image/png" sizes="32x32" href={favicon} />
	<link rel="icon" type="image/png" sizes="16x16" href={favicon} />
	<link rel="apple-touch-icon" sizes="180x180" href={favicon} />
	
	<!-- Default Meta Tags -->
	<meta name="description" content="TruckBooks - Manage your fleet's finances in one place. Track trips, payments, costs, and profit or loss per trip. Monitor truck performance and outstanding customer balances." />
	<meta name="keywords" content="truck management, fleet management, logistics software, trucking operations, fleet finance, trip tracking, truck maintenance" />
	<meta name="author" content="TruckBooks" />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href={currentUrl} />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta property="og:title" content="TruckBooks - Fleet Management & Logistics Operations Software" />
	<meta property="og:description" content="Manage your fleet's finances in one place. Track trips, payments, costs, and profit or loss per trip. Monitor truck performance and outstanding customer balances." />
	<meta property="og:image" content={logoUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:site_name" content="TruckBooks" />
	
	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={currentUrl} />
	<meta name="twitter:title" content="TruckBooks - Fleet Management & Logistics Operations Software" />
	<meta name="twitter:description" content="Manage your fleet's finances in one place. Track trips, payments, costs, and profit or loss per trip." />
	<meta name="twitter:image" content={logoUrl} />
</svelte:head>
{@render children()}
