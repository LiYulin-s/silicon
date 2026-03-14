import { Language, Parser, Tree } from 'web-tree-sitter';
import treeSitterWasmUrl from '$lib/assets/web-tree-sitter.wasm?url';
import bashWasmUrl from '$lib/assets/tree-sitter-bash.wasm?url';
import cWasmUrl from '$lib/assets/tree-sitter-c.wasm?url';
import cppWasmUrl from '$lib/assets/tree-sitter-cpp.wasm?url';
import csharpWasmUrl from '$lib/assets/tree-sitter-c_sharp.wasm?url';
import cssWasmUrl from '$lib/assets/tree-sitter-css.wasm?url';
import elixirWasmUrl from '$lib/assets/tree-sitter-elixir.wasm?url';
import goWasmUrl from '$lib/assets/tree-sitter-go.wasm?url';
import htmlWasmUrl from '$lib/assets/tree-sitter-html.wasm?url';
import javaWasmUrl from '$lib/assets/tree-sitter-java.wasm?url';
import javascriptWasmUrl from '$lib/assets/tree-sitter-javascript.wasm?url';
import jsonWasmUrl from '$lib/assets/tree-sitter-json.wasm?url';
import phpWasmUrl from '$lib/assets/tree-sitter-php.wasm?url';
import pythonWasmUrl from '$lib/assets/tree-sitter-python.wasm?url';
import rubyWasmUrl from '$lib/assets/tree-sitter-ruby.wasm?url';
import rustWasmUrl from '$lib/assets/tree-sitter-rust.wasm?url';
import scalaWasmUrl from '$lib/assets/tree-sitter-scala.wasm?url';
import tsxWasmUrl from '$lib/assets/tree-sitter-tsx.wasm?url';
import typescriptWasmUrl from '$lib/assets/tree-sitter-typescript.wasm?url';
import zigWasmUrl from '$lib/assets/tree-sitter-zig.wasm?url';
import type { SnippetLanguage } from './types';

const languageWasmById: Record<SnippetLanguage, string> = {
	bash: bashWasmUrl,
	c: cWasmUrl,
	cpp: cppWasmUrl,
	csharp: csharpWasmUrl,
	css: cssWasmUrl,
	elixir: elixirWasmUrl,
	go: goWasmUrl,
	html: htmlWasmUrl,
	java: javaWasmUrl,
	javascript: javascriptWasmUrl,
	json: jsonWasmUrl,
	php: phpWasmUrl,
	python: pythonWasmUrl,
	ruby: rubyWasmUrl,
	rust: rustWasmUrl,
	scala: scalaWasmUrl,
	tsx: tsxWasmUrl,
	typescript: typescriptWasmUrl,
	zig: zigWasmUrl
};

let parserInitPromise: Promise<void> | null = null;
const languageCache = new Map<SnippetLanguage, Language>();
const parserCache = new Map<SnippetLanguage, Parser>();
const parserPromiseCache = new Map<SnippetLanguage, Promise<Parser>>();

async function initParserRuntime(): Promise<void> {
	if (!parserInitPromise) {
		parserInitPromise = Parser.init({
			locateFile: () => treeSitterWasmUrl
		});
	}

	await parserInitPromise;
}

async function loadLanguage(language: SnippetLanguage): Promise<Language> {
	const cached = languageCache.get(language);
	if (cached) {
		return cached;
	}

	const wasmUrl = languageWasmById[language];
	if (!wasmUrl) {
		throw new Error(`Unsupported language: ${language}`);
	}

	await initParserRuntime();
	const runtimeLanguage = await Language.load(wasmUrl);
	languageCache.set(language, runtimeLanguage);
	return runtimeLanguage;
}

async function getParser(language: SnippetLanguage): Promise<Parser> {
	const cached = parserCache.get(language);
	if (cached) {
		return cached;
	}

	const cachedPromise = parserPromiseCache.get(language);
	if (cachedPromise) {
		return cachedPromise;
	}

	const parserPromise = (async () => {
		// Guard against race conditions where `new Parser()` runs before init resolves.
		await initParserRuntime();
		const parser = new Parser();
		parser.setLanguage(await loadLanguage(language));
		parserCache.set(language, parser);
		return parser;
	})();

	parserPromiseCache.set(language, parserPromise);

	try {
		return await parserPromise;
	} finally {
		parserPromiseCache.delete(language);
	}
}

export async function parseCode(language: SnippetLanguage, code: string): Promise<Tree | null> {
	const parser = await getParser(language);
	return parser.parse(code);
}

export async function getRuntimeLanguage(language: SnippetLanguage): Promise<Language> {
	return loadLanguage(language);
}
