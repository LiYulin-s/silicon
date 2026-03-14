<script lang="ts">
	interface Props {
		canExport: boolean;
		isDownloading: boolean;
		isCopying: boolean;
		downloadLabel: string;
		copyLabel: string;
		renderingLabel: string;
		copyingLabel: string;
		statusMessage: string;
		errorMessage: string;
		onDownload: () => void;
		onCopy: () => void;
	}

	let {
		canExport,
		isDownloading,
		isCopying,
		downloadLabel,
		copyLabel,
		renderingLabel,
		copyingLabel,
		statusMessage,
		errorMessage,
		onDownload,
		onCopy
	}: Props = $props();
</script>

<section class="card border border-base-300 bg-base-100 shadow-sm">
	<div class="card-body gap-3">
		<div class="flex flex-wrap items-center gap-2">
			<button
				type="button"
				class="btn btn-primary"
				onclick={onDownload}
				disabled={!canExport || isDownloading || isCopying}
			>
				{isDownloading ? renderingLabel : downloadLabel}
			</button>
			<button
				type="button"
				class="btn btn-outline"
				onclick={onCopy}
				disabled={!canExport || isDownloading || isCopying}
			>
				{isCopying ? copyingLabel : copyLabel}
			</button>
		</div>

		{#if statusMessage}
			<p class="text-sm text-success" role="status">{statusMessage}</p>
		{/if}

		{#if errorMessage}
			<p class="text-sm text-error" role="alert">{errorMessage}</p>
		{/if}
	</div>
</section>
