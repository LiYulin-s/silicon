import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	return {
		code: url.searchParams.get('code') || undefined,
		language: url.searchParams.get('language') || undefined
	};
};
