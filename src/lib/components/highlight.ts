import { Query, type Node } from 'web-tree-sitter';
import { getRuntimeLanguage, parseCode } from './treesitter';
import type {
	FoldRange,
	HighlightResult,
	HighlightSegment,
	HighlightToken,
	HighlightTokenClass,
	SnippetLanguage
} from './types';
import bashHighlightQuery from 'tree-sitter-bash/queries/highlights.scm?raw';
import cHighlightQuery from 'tree-sitter-c/queries/highlights.scm?raw';
import cppHighlightQuery from 'tree-sitter-cpp/queries/highlights.scm?raw';
import csharpHighlightQuery from 'tree-sitter-c-sharp/queries/highlights.scm?raw';
import cssHighlightQuery from 'tree-sitter-css/queries/highlights.scm?raw';
import elixirHighlightQuery from 'tree-sitter-elixir/queries/highlights.scm?raw';
import goHighlightQuery from 'tree-sitter-go/queries/highlights.scm?raw';
import htmlHighlightQuery from 'tree-sitter-html/queries/highlights.scm?raw';
import javaHighlightQuery from 'tree-sitter-java/queries/highlights.scm?raw';
import javascriptHighlightQuery from 'tree-sitter-javascript/queries/highlights.scm?raw';
import jsonHighlightQuery from 'tree-sitter-json/queries/highlights.scm?raw';
import phpHighlightQuery from 'tree-sitter-php/queries/highlights.scm?raw';
import pythonHighlightQuery from 'tree-sitter-python/queries/highlights.scm?raw';
import rubyHighlightQuery from 'tree-sitter-ruby/queries/highlights.scm?raw';
import rustHighlightQuery from 'tree-sitter-rust/queries/highlights.scm?raw';
import scalaHighlightQuery from 'tree-sitter-scala/queries/highlights.scm?raw';
import typescriptHighlightQuery from 'tree-sitter-typescript/queries/highlights.scm?raw';
import zigHighlightQuery from '@tree-sitter-grammars/tree-sitter-zig/queries/highlights.scm?raw';

const HIGHLIGHT_QUERY_SOURCE_BY_LANGUAGE: Partial<Record<SnippetLanguage, string>> = {
	bash: bashHighlightQuery,
	c: cHighlightQuery,
	cpp: cppHighlightQuery,
	csharp: csharpHighlightQuery,
	css: cssHighlightQuery,
	elixir: elixirHighlightQuery,
	go: goHighlightQuery,
	html: htmlHighlightQuery,
	java: javaHighlightQuery,
	javascript: javascriptHighlightQuery,
	json: jsonHighlightQuery,
	php: phpHighlightQuery,
	python: pythonHighlightQuery,
	ruby: rubyHighlightQuery,
	rust: rustHighlightQuery,
	scala: scalaHighlightQuery,
	tsx: typescriptHighlightQuery,
	typescript: typescriptHighlightQuery,
	zig: zigHighlightQuery
};

const queryCache = new Map<SnippetLanguage, Query | null>();

const KEYWORD_NODE_TYPES = new Set([
	'const',
	'let',
	'var',
	'function',
	'class',
	'if',
	'else',
	'return',
	'switch',
	'case',
	'for',
	'while',
	'await',
	'async',
	'try',
	'catch',
	'throw',
	'new',
	'import',
	'export',
	'default',
	'extends',
	'implements',
	'type',
	'interface',
	'public',
	'private',
	'protected',
	'readonly',
	'from',
	'as',
	'true',
	'false',
	'null'
]);

const FOLDABLE_NODE_TYPES = new Set([
	'program',
	'class_body',
	'statement_block',
	'object',
	'array',
	'arguments',
	'formal_parameters'
]);

function classifyCaptureName(captureName: string): HighlightTokenClass | null {
	const normalized = captureName.replace(/^_+/, '').toLowerCase();

	if (normalized.includes('comment')) return 'token-comment';
	if (normalized.includes('keyword')) return 'token-keyword';
	if (normalized.includes('string')) return 'token-string';
	if (
		normalized.includes('number') ||
		normalized.includes('float') ||
		normalized.includes('integer')
	) {
		return 'token-number';
	}
	if (
		normalized.includes('function') ||
		normalized.includes('method') ||
		normalized.includes('constructor')
	) {
		return 'token-function';
	}
	if (
		normalized.includes('property') ||
		normalized.includes('field') ||
		normalized.includes('member')
	) {
		return 'token-property';
	}
	if (normalized.includes('type') || normalized.includes('builtin')) return 'token-type';
	if (normalized.includes('operator')) return 'token-operator';
	if (normalized.includes('punctuation')) return 'token-punctuation';
	if (normalized.includes('tag')) return 'token-tag';
	if (normalized.includes('attribute')) return 'token-attribute';
	if (normalized.includes('variable') || normalized.includes('parameter')) return 'token-variable';
	if (normalized.includes('constant')) return 'token-constant';
	if (normalized.includes('namespace') || normalized.includes('module')) return 'token-namespace';
	if (normalized.includes('escape')) return 'token-escape';
	if (normalized.includes('boolean')) return 'token-boolean';
	if (normalized.includes('error')) return 'token-error';

	return null;
}

async function getHighlightQuery(language: SnippetLanguage): Promise<Query | null> {
	const cached = queryCache.get(language);
	if (cached !== undefined) {
		return cached;
	}

	const source = HIGHLIGHT_QUERY_SOURCE_BY_LANGUAGE[language];
	if (!source) {
		queryCache.set(language, null);
		return null;
	}

	try {
		const runtimeLanguage = await getRuntimeLanguage(language);
		const query = new Query(runtimeLanguage, source);
		queryCache.set(language, query);
		return query;
	} catch (error) {
		console.warn(`Failed to load highlight query for ${language}`, error);
		queryCache.set(language, null);
		return null;
	}
}

function classifyNodeType(nodeType: string): HighlightTokenClass {
	if (nodeType.includes('comment')) return 'token-comment';
	if (nodeType.includes('string') || nodeType.includes('template')) return 'token-string';
	if (nodeType.includes('number') || nodeType.includes('integer') || nodeType.includes('float')) {
		return 'token-number';
	}
	if (nodeType.includes('function') || nodeType.includes('method')) return 'token-function';
	if (nodeType.includes('property') || nodeType.includes('member')) return 'token-property';
	if (nodeType.includes('type')) return 'token-type';
	if (nodeType.includes('operator')) return 'token-operator';
	if (KEYWORD_NODE_TYPES.has(nodeType)) return 'token-keyword';
	return 'token-identifier';
}

function normalizeTokens(tokens: HighlightToken[]): HighlightToken[] {
	tokens.sort((a, b) => {
		if (a.start === b.start) {
			return a.end - b.end;
		}
		return a.start - b.start;
	});

	const normalized: HighlightToken[] = [];
	for (const token of tokens) {
		const previous = normalized[normalized.length - 1];
		if (!previous || token.start >= previous.end) {
			normalized.push(token);
		}
	}

	return normalized;
}

function walkNodes(node: Node, visit: (value: Node) => void): void {
	visit(node);
	for (let i = 0; i < node.childCount; i += 1) {
		const child = node.child(i);
		if (child) {
			walkNodes(child, visit);
		}
	}
}

function buildTokensByNodeType(rootNode: Node): HighlightToken[] {
	const tokens: HighlightToken[] = [];

	walkNodes(rootNode, (node) => {
		if (node.childCount > 0) return;
		if (node.startIndex === node.endIndex) return;

		tokens.push({
			start: node.startIndex,
			end: node.endIndex,
			className: classifyNodeType(node.type)
		});
	});

	return normalizeTokens(tokens);
}

function buildTokensFromQuery(rootNode: Node, query: Query): HighlightToken[] {
	const captures = query.captures(rootNode);
	const tokens: HighlightToken[] = [];

	for (const capture of captures) {
		const className = classifyCaptureName(capture.name);
		if (!className) continue;
		if (capture.node.startIndex === capture.node.endIndex) continue;

		tokens.push({
			start: capture.node.startIndex,
			end: capture.node.endIndex,
			className
		});
	}

	return normalizeTokens(tokens);
}

function buildLineOffsets(code: string): { start: number; end: number; content: string }[] {
	const lines = code.split('\n');
	const lineOffsets: { start: number; end: number; content: string }[] = [];
	let cursor = 0;

	for (const line of lines) {
		const start = cursor;
		const end = cursor + line.length;
		lineOffsets.push({ start, end, content: line });
		cursor = end + 1;
	}

	if (code.endsWith('\n')) {
		lineOffsets.push({ start: cursor, end: cursor, content: '' });
	}

	return lineOffsets;
}

function renderLineSegments(
	lineStart: number,
	lineEnd: number,
	lineContent: string,
	tokens: HighlightToken[]
): HighlightSegment[] {
	if (lineContent.length === 0) {
		return [{ text: '\u00A0' }];
	}

	const segments: HighlightSegment[] = [];
	let cursor = lineStart;

	for (const token of tokens) {
		if (token.end <= lineStart || token.start >= lineEnd) continue;

		const clampedStart = Math.max(token.start, lineStart);
		const clampedEnd = Math.min(token.end, lineEnd);
		if (clampedStart > cursor) {
			segments.push({ text: lineContent.slice(cursor - lineStart, clampedStart - lineStart) });
		}

		segments.push({
			text: lineContent.slice(clampedStart - lineStart, clampedEnd - lineStart),
			className: token.className
		});
		cursor = clampedEnd;
	}

	if (cursor < lineEnd) {
		segments.push({ text: lineContent.slice(cursor - lineStart) });
	}

	return segments;
}

function extractFoldRanges(rootNode: Node): FoldRange[] {
	const ranges: FoldRange[] = [];
	const seen = new Set<string>();

	walkNodes(rootNode, (node: Node) => {
		if (!FOLDABLE_NODE_TYPES.has(node.type)) return;

		const startLine = node.startPosition.row + 1;
		const endLine = node.endPosition.row + 1;
		if (endLine - startLine < 2) return;

		const key = `${startLine}:${endLine}`;
		if (seen.has(key)) return;
		seen.add(key);
		ranges.push({ startLine, endLine });
	});

	ranges.sort((a, b) => a.startLine - b.startLine || b.endLine - a.endLine);
	return ranges;
}

function fallbackPlainText(code: string, warning?: string): HighlightResult {
	const lines = code.split('\n').map((line, index) => ({
		number: index + 1,
		segments: [{ text: line || '\u00A0' }]
	}));

	return {
		lines,
		foldRanges: [],
		warning
	};
}

export async function highlightSource(
	code: string,
	language: SnippetLanguage
): Promise<HighlightResult> {
	if (!code.trim()) {
		return {
			lines: [{ number: 1, segments: [{ text: '\u00A0' }] }],
			foldRanges: []
		};
	}

	try {
		const tree = await parseCode(language, code);
		if (!tree) {
			return fallbackPlainText(code, 'Tree-sitter parser unavailable, using plain text fallback.');
		}

		const query = await getHighlightQuery(language);
		const queryTokens = query ? buildTokensFromQuery(tree.rootNode, query) : [];
		const tokens = queryTokens.length > 0 ? queryTokens : buildTokensByNodeType(tree.rootNode);
		const lineOffsets = buildLineOffsets(code);
		const lines = lineOffsets.map((line, index) => ({
			number: index + 1,
			segments: renderLineSegments(line.start, line.end, line.content, tokens)
		}));

		const foldRanges = extractFoldRanges(tree.rootNode);
		tree.delete();
		return { lines, foldRanges };
	} catch (error) {
		console.error(error);
		return fallbackPlainText(code, 'Tree-sitter failed to parse. Rendering plain text instead.');
	}
}
