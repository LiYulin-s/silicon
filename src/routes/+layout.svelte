<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { onMount } from 'svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import * as m from '$lib/paraglide/messages.js';

	let { children } = $props();

	const THEMES = [
		'dark',
		'light',
		'synthwave',
		'dracula',
		'nord',
		'dim',
		'night',
		'sunset',
		'cyberpunk',
		'retro',
		'silk',
		'cupcake',
		'vscode'
	] as const;

	let currentTheme = $state<(typeof THEMES)[number]>('dark');

	function applyTheme(theme: (typeof THEMES)[number]): void {
		if (!browser) return;
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}

	onMount(() => {
		const savedTheme = localStorage.getItem('theme');
		const nextTheme =
			savedTheme && THEMES.includes(savedTheme as (typeof THEMES)[number])
				? (savedTheme as (typeof THEMES)[number])
				: currentTheme;
		currentTheme = nextTheme;
		applyTheme(nextTheme);
	});

	function setTheme(theme: (typeof THEMES)[number]): void {
		currentTheme = theme;
		applyTheme(theme);
	}
</script>

<svelte:head>
	<title>{m.app_title()}</title>
	<meta name="description" content={m.app_desc()} />
	<link rel="icon" href={favicon} />
</svelte:head>

<main class="min-h-screen bg-base-200">
	<nav
		class="sticky top-0 isolate z-120 overflow-visible border-b border-base-300/70 bg-base-100/80 backdrop-blur-md"
	>
		<div class="navbar mx-auto w-full max-w-7xl px-4 md:px-8">
			<div class="navbar-start">
				<p class="font-mono text-sm tracking-[0.2em] text-primary uppercase">{m.nav_brand()}</p>
			</div>
			<div class="navbar-end gap-3">
				<a
					href="https://github.com/LiYulin-s/silicon"
					target="_blank"
					rel="noreferrer"
					class="btn btn-ghost btn-sm"
					aria-label="GitHub repository"
				>
					GitHub
				</a>
				<div class="dropdown dropdown-end">
					<button
						type="button"
						tabindex="0"
						class="btn gap-2 btn-ghost btn-sm"
						aria-label={m.theme_label()}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							class="size-4"
						>
							<circle cx="12" cy="12" r="3"></circle>
							<path
								d="M12 2v2m0 16v2M2 12h2m16 0h2m-3.07-6.93-1.41 1.41M6.48 17.52l-1.41 1.41m0-13.86 1.41 1.41m11.04 11.04 1.41 1.41"
							></path>
						</svg>
						<span class="hidden text-xs font-medium uppercase sm:inline">{currentTheme}</span>
					</button>
					<ul
						class="dropdown-content menu mt-2 w-44 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
					>
						{#each THEMES as theme (theme)}
							<li>
								<button
									type="button"
									class:active={currentTheme === theme}
									onclick={() => setTheme(theme)}
								>
									{theme}
								</button>
							</li>
						{/each}
					</ul>
				</div>
				<div class="text-sm text-base-content/70">{m.nav_tagline()}</div>
			</div>
		</div>
	</nav>
	{@render children()}

	<div style="display:none">
		{#each locales as locale (locale)}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
		{/each}
	</div>

	<footer class="border-t border-base-300/70 bg-base-100/60">
		<div class="mx-auto w-full max-w-7xl px-4 py-6 text-sm text-base-content/65 md:px-8">
			<p>{m.footer_text()}</p>
		</div>
	</footer>
</main>
