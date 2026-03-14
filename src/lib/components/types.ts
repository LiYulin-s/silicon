export type HighlightTokenClass =
	| 'token-comment'
	| 'token-keyword'
	| 'token-string'
	| 'token-number'
	| 'token-function'
	| 'token-property'
	| 'token-identifier'
	| 'token-operator'
	| 'token-type'
	| 'token-punctuation'
	| 'token-tag'
	| 'token-attribute'
	| 'token-variable'
	| 'token-constant'
	| 'token-namespace'
	| 'token-escape'
	| 'token-boolean'
	| 'token-error';

export interface LanguageOption {
	value: string;
	label: string;
}

export type SnippetLanguage = string;

export interface HighlightToken {
	start: number;
	end: number;
	className: HighlightTokenClass;
}

export interface HighlightedLine {
	number: number;
	segments: HighlightSegment[];
}

export interface HighlightSegment {
	text: string;
	className?: HighlightTokenClass;
}

export interface FoldRange {
	startLine: number;
	endLine: number;
}

export interface HighlightResult {
	lines: HighlightedLine[];
	foldRanges: FoldRange[];
	warning?: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
	{ value: 'bash', label: 'Bash' },
	{ value: 'c', label: 'C' },
	{ value: 'cpp', label: 'C++' },
	{ value: 'csharp', label: 'C#' },
	{ value: 'css', label: 'CSS' },
	{ value: 'elixir', label: 'Elixir' },
	{ value: 'go', label: 'Go' },
	{ value: 'html', label: 'HTML' },
	{ value: 'java', label: 'Java' },
	{ value: 'javascript', label: 'JavaScript' },
	{ value: 'json', label: 'JSON' },
	{ value: 'php', label: 'PHP' },
	{ value: 'python', label: 'Python' },
	{ value: 'ruby', label: 'Ruby' },
	{ value: 'rust', label: 'Rust' },
	{ value: 'scala', label: 'Scala' },
	{ value: 'tsx', label: 'TSX' },
	{ value: 'typescript', label: 'TypeScript' },
	{ value: 'zig', label: 'Zig' }
];
