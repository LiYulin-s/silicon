import { toBlob, toPng } from 'html-to-image';

function getRenderBackground(): string | undefined {
	const baseColor = getComputedStyle(document.documentElement)
		.getPropertyValue('--color-base-100')
		.trim();
	if (!baseColor) {
		return undefined;
	}

	return baseColor;
}

function normalizeFileName(name: string): string {
	const trimmed = name.trim();
	if (!trimmed) {
		return 'code-snippet';
	}

	return trimmed.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-');
}

export async function downloadSnippetAsPng(node: HTMLElement, fileName: string): Promise<void> {
	const dataUrl = await toPng(node, {
		cacheBust: true,
		pixelRatio: 2,
		backgroundColor: getRenderBackground()
	});

	const anchor = document.createElement('a');
	anchor.href = dataUrl;
	anchor.download = `${normalizeFileName(fileName)}.png`;
	anchor.click();
}

export async function copySnippetToClipboard(node: HTMLElement): Promise<void> {
	if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
		throw new Error('Clipboard image API is not supported in this browser.');
	}

	const blob = await toBlob(node, {
		cacheBust: true,
		pixelRatio: 2,
		backgroundColor: getRenderBackground()
	});

	if (!blob) {
		throw new Error('Failed to create PNG blob from snippet.');
	}

	await navigator.clipboard.write([
		new ClipboardItem({
			[blob.type]: blob
		})
	]);
}
