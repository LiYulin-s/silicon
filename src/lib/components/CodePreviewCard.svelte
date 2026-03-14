<script lang="ts">
	import { fade } from 'svelte/transition';
	import { LANGUAGE_OPTIONS, type HighlightedLine, type SnippetLanguage } from './types';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		code: string;
		fileName: string;
		wrapLines: boolean;
		language: SnippetLanguage;
		lines: HighlightedLine[];
		onCodeChange: (nextValue: string) => void;
		onFileNameChange: (nextValue: string) => void;
		onLanguageChange: (nextValue: SnippetLanguage) => void;
	}

	let {
		code,
		fileName,
		wrapLines,
		language,
		lines,
		onCodeChange,
		onFileNameChange,
		onLanguageChange
	}: Props = $props();

	function syncScroll(event: Event): void {
		const textarea = event.currentTarget as HTMLTextAreaElement;
		const editorContainer = textarea.closest('[data-editor-grid]');
		const highlightLayer = textarea.parentElement?.querySelector('pre');
		const lineNumberLayer = editorContainer?.querySelector('[data-line-numbers]');

		if (highlightLayer instanceof HTMLElement) {
			highlightLayer.scrollTop = textarea.scrollTop;
			highlightLayer.scrollLeft = textarea.scrollLeft;
		}

		if (lineNumberLayer instanceof HTMLElement) {
			lineNumberLayer.style.transform = `translateY(${-textarea.scrollTop}px)`;
		}
	}
</script>

<article
	class="snippet-shell relative overflow-hidden rounded-box border border-base-300 shadow-xl"
>
	<header
		class="flex items-center justify-between border-b border-base-300/70 bg-base-100/40 px-4 py-3 backdrop-blur-md"
	>
		<div class="flex w-24 items-center gap-2">
			<span class="inline-block h-3 w-3 rounded-full bg-error"></span>
			<span class="inline-block h-3 w-3 rounded-full bg-warning"></span>
			<span class="inline-block h-3 w-3 rounded-full bg-success"></span>
		</div>
		<div class="flex min-w-0 flex-1 items-center justify-end gap-2">
			<input
				class="input input-xs h-7 min-w-0 flex-1 input-ghost font-mono text-xs"
				value={fileName}
				aria-label={m.filename_label()}
				oninput={(event) => onFileNameChange((event.currentTarget as HTMLInputElement).value)}
			/>
			<select
				class="select h-7 w-32 shrink-0 select-ghost select-xs font-mono"
				value={language}
				aria-label={m.language_label()}
				onchange={(event) =>
					onLanguageChange((event.currentTarget as HTMLSelectElement).value as SnippetLanguage)}
			>
				{#each LANGUAGE_OPTIONS as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>
	</header>

	<div
		class="relative grid grid-cols-[auto_1fr] bg-base-100/10 px-0 py-3 backdrop-blur-sm"
		data-editor-grid
	>
		{#if wrapLines}
			<div class="pointer-events-none overflow-hidden px-3" transition:fade>
				<div class="font-mono text-sm leading-6 text-base-content/45 select-none" data-line-numbers>
					{#each lines as line (line.number)}
						<div class="w-10 text-right">{line.number}</div>
					{/each}
				</div>
			</div>
		{/if}

		<div class="relative">
			<pre
				class="pointer-events-none m-0 overflow-hidden bg-transparent px-3 py-0 font-mono text-sm leading-6"><code
					class="block"
					>{#each lines as line (line.number)}<div
							class={wrapLines
								? 'wrap-break-word whitespace-pre-wrap'
								: 'whitespace-pre'}>{#each line.segments as segment, index (index)}<span
									class={segment.className}>{segment.text}</span
								>{/each}</div>{/each}</code
				></pre>

			<textarea
				class={`absolute inset-0 h-full w-full resize-none bg-transparent px-3 py-0 font-mono text-sm leading-6 text-transparent placeholder-base-content/30 caret-base-content focus:outline-none ${wrapLines ? 'overflow-x-hidden overflow-y-auto wrap-break-word whitespace-pre-wrap' : 'overflow-auto whitespace-pre'}`}
				spellcheck="false"
				wrap={wrapLines ? 'soft' : 'off'}
				value={code}
				placeholder="Paste your code here..."
				oninput={(event) => onCodeChange((event.currentTarget as HTMLTextAreaElement).value)}
				onscroll={syncScroll}
			></textarea>
		</div>
	</div>
</article>
