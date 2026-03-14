<script lang="ts">
	import { CarbonSnippet } from '$lib';
	import * as m from '$lib/paraglide/messages.js';

	const { data } = $props();
	// svelte-ignore state_referenced_locally
	const { code, language } = data;
	const demoCode = `import { toPng } from 'html-to-image';

type Theme = 'light' | 'night';

export async function captureCard(node: HTMLElement, theme: Theme) {
	const dataUrl = await toPng(node, {
		cacheBust: true,
		pixelRatio: 2,
		backgroundColor: theme === 'night' ? '#101218' : '#ffffff'
	});

	return dataUrl;
}`;
</script>

<section class="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
	<header class="space-y-2">
		<p class="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
			DaisyUI + Tree-sitter
		</p>
		<h1 class="text-3xl font-black tracking-tight md:text-4xl">{m.app_title()}</h1>
		<p class="max-w-3xl text-sm text-base-content/70 md:text-base">{m.app_desc()}</p>
	</header>

	<CarbonSnippet
		initialCode={code || demoCode}
		initialLanguage={language || 'typescript'}
		initialFileName="capture-card.ts"
	/>
</section>
