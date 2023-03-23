import { ScraperResponse } from "../types";

/** All available scrapers */
export type Provider =
	| "Manga2"
	| "Mangadex"
	| "RCO"
	| "nhentai"
	| "nhentainet"
	| "Manga1"
	| "ComicExtra"
	| "Mangahere"
	| "Mangadex5"
	| "Guya";
export type ProviderId =
	| "manga2"
	| "mangadex"
	| "rco"
	| "nhentai"
	| "nhentainet"
	| "manga1"
	| "comicextra"
	| "mangahere"
	| "mangadex5"
	| "guya";

export interface SearchOptions {
	resultCount: number;
}

export interface SearchError {
	error: string;
}


/**
 * A scraper
 * This can be any of the scrapers
 */
export abstract class Scraper {
	public provider: Provider;
	public canSearch: boolean;
	public nsfw: boolean;
	public searchDisplay?: string;

	public abstract scrape(
		slug: string | number,
		chapterId?: string | number
	): Promise<ScraperResponse>;

	public abstract search(
		query: string,
		options?: Partial<SearchOptions>
	): Promise<ScraperResponse[] | SearchError>;

}
