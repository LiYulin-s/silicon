<script lang="ts">
	import { LANGUAGE_OPTIONS, type SnippetLanguage } from './types';

	interface Props {
		code: string;
		language: SnippetLanguage;
		fileName: string;
		wrapLines: boolean;
		onCodeChange: (nextValue: string) => void;
		onLanguageChange: (nextValue: SnippetLanguage) => void;
		onFileNameChange: (nextValue: string) => void;
		onWrapChange: (nextValue: boolean) => void;
	}

	let {
		code,
		language,
		fileName,
		wrapLines,
		onCodeChange,
		onLanguageChange,
		onFileNameChange,
		onWrapChange
	}: Props = $props();
</script>

<section class="card border border-base-300 bg-base-100 shadow-sm">
	<div class="card-body gap-4">
		<div class="grid gap-3 md:grid-cols-[1fr_220px_160px]">
			<label class="form-control w-full">
				<span class="label-text text-xs tracking-wide uppercase">File Name</span>
				<input
					class="input-bordered input w-full"
					value={fileName}
					oninput={(event) => onFileNameChange((event.currentTarget as HTMLInputElement).value)}
				/>
			</label>
			<label class="form-control w-full">
				<span class="label-text text-xs tracking-wide uppercase">Language</span>
				<select
					class="select-bordered select"
					value={language}
					onchange={(event) =>
						onLanguageChange((event.currentTarget as HTMLSelectElement).value as SnippetLanguage)}
				>
					{#each LANGUAGE_OPTIONS as option (option.value)}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</label>
			<label class="label cursor-pointer gap-2 self-end">
				<span class="label-text">Wrap lines</span>
				<input
					type="checkbox"
					class="toggle toggle-primary"
					checked={wrapLines}
					onchange={(event) => onWrapChange((event.currentTarget as HTMLInputElement).checked)}
				/>
			</label>
		</div>
		<textarea
			class="textarea-bordered textarea min-h-80 w-full resize-y font-mono text-sm leading-6"
			spellcheck="false"
			value={code}
			oninput={(event) => onCodeChange((event.currentTarget as HTMLTextAreaElement).value)}
		></textarea>
	</div>
</section>
