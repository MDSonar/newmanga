// Utility function for genres

import {
	ProviderId,
	Scraper,
	SearchError,
	SearchOptions,
} from "../scrapers/types";
import * as scrapers from "../scrapers";
import { getProviderName } from "../routers/manga-page";
import { ScraperResponse } from "../types";

export async function doGenres(
	provider: ProviderId,
	query = "",
	genresOptions: Partial<SearchOptions> = {}
): Promise<ScraperResponse[] | SearchError> {
	// Get and verify scraper
	const scraper: Scraper | undefined = scrapers[getProviderName(provider)];
	if (!scraper) {
		return null;
	}

	// Get Genres results
	const genresResults = await scraper.search(query, {
		...genresOptions,
		resultCount: 20,
	});

	// Give back results
	return genresResults || []; // Return empty array if there's a falsy response
}
