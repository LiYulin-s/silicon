<script lang="ts">
	import { browser } from '$app/environment';
	import { highlightSource } from './highlight';
	import { copySnippetToClipboard, downloadSnippetAsPng } from './export';
	import CodePreviewCard from './CodePreviewCard.svelte';
	import './snippet.css';
	import { type HighlightedLine, type SnippetLanguage } from './types';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		initialCode?: string;
		initialLanguage?: SnippetLanguage;
		initialFileName?: string;
	}

	let {
		initialCode = "const hello = 'world';",
		initialLanguage = 'typescript',
		initialFileName = 'snippet.ts'
	}: Props = $props();

	let code = $state("const hello = 'world';");
	let language = $state<SnippetLanguage>('typescript');
	let fileName = $state('snippet.ts');
	let wrapLines = $state(false);
	let hasHydratedInitialValues = $state(false);

	let lines = $state<HighlightedLine[]>([{ number: 1, segments: [{ text: '\u00A0' }] }]);
	let parseWarning = $state('');
	let statusMessage = $state('');
	let errorMessage = $state('');
	let isParsing = $state(false);
	let isDownloading = $state(false);
	let isCopying = $state(false);
	let previewElement = $state<HTMLElement | null>(null);

	let canExport = $derived(Boolean(previewElement) && lines.length > 0 && !isParsing);

	$effect(() => {
		if (hasHydratedInitialValues) return;
		code = initialCode;
		language = initialLanguage;
		fileName = initialFileName;
		hasHydratedInitialValues = true;
	});

	$effect(() => {
		if (!browser) return;

		isParsing = true;
		parseWarning = '';
		errorMessage = '';
		const activeCode = code;
		const activeLanguage = language;
		let cancelled = false;

		void (async () => {
			const result = await highlightSource(activeCode, activeLanguage);
			if (cancelled) return;

			lines = result.lines;
			parseWarning = result.warning ?? '';
			isParsing = false;
		})();

		return () => {
			cancelled = true;
		};
	});

	function clearMessages(): void {
		statusMessage = '';
		errorMessage = '';
	}

	function handleCodeChange(nextValue: string): void {
		clearMessages();
		code = nextValue;
	}

	function handleFileNameChange(nextValue: string): void {
		clearMessages();
		fileName = nextValue;
	}

	function handleLanguageChange(nextValue: SnippetLanguage): void {
		clearMessages();
		language = nextValue;
	}

	async function handleDownload(): Promise<void> {
		if (!previewElement) return;
		isDownloading = true;
		clearMessages();

		try {
			await downloadSnippetAsPng(previewElement, fileName);
			statusMessage = m.downloaded();
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Failed to download PNG.';
		} finally {
			isDownloading = false;
		}
	}

	async function handleCopy(): Promise<void> {
		if (!previewElement) return;
		isCopying = true;
		clearMessages();

		try {
			await copySnippetToClipboard(previewElement);
			statusMessage = m.copied();
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Failed to copy image to clipboard.';
		} finally {
			isCopying = false;
		}
	}
</script>

<section class="space-y-4">
	<div
		class="menu flex w-full items-end justify-end gap-3 rounded-xl border border-base-300 bg-base-100 px-3 py-3 shadow-sm"
	>
		<div class="flex items-center gap-2 max-md:w-full max-md:flex-wrap max-md:justify-between">
			<label class="label cursor-pointer gap-2 px-1">
				<span class="label-text">{m.wrap_lines_label()}</span>
				<input type="checkbox" class="toggle z-0 toggle-primary" bind:checked={wrapLines} />
			</label>

			<button
				type="button"
				class="btn btn-primary"
				onclick={handleDownload}
				disabled={!canExport || isDownloading || isCopying}
			>
				{isDownloading ? m.rendering_png() : m.download_png()}
			</button>

			<button
				type="button"
				class="btn btn-outline"
				onclick={handleCopy}
				disabled={!canExport || isDownloading || isCopying}
			>
				{isCopying ? m.copying() : m.copy_image()}
			</button>
		</div>
	</div>
	<div
		class="relative flex max-w-full items-start justify-center overflow-hidden rounded-2xl bg-base-300 p-8"
	>
		<div bind:this={previewElement} class="w-fit">
			<CodePreviewCard
				{code}
				{fileName}
				{wrapLines}
				{language}
				{lines}
				onCodeChange={handleCodeChange}
				onFileNameChange={handleFileNameChange}
				onLanguageChange={handleLanguageChange}
			/>
		</div>
	</div>

	{#if statusMessage || errorMessage || isParsing || parseWarning}
		<div class="text-xs text-base-content/70">
			{#if statusMessage}
				<p class="text-sm text-success" role="status">{statusMessage}</p>
			{/if}

			{#if errorMessage}
				<p class="text-sm text-error" role="alert">{errorMessage}</p>
			{/if}

			{#if isParsing}
				<p>Parsing and highlighting source...</p>
			{:else if parseWarning}
				<p>{parseWarning}</p>
			{/if}
		</div>
	{/if}
</section>
