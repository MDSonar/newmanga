import chalk from "chalk";
import fetch from "node-fetch-extra";
import { JSDOM } from "jsdom";
import { error } from "./index";
import { Chapter, ScraperError, ScraperResponse } from "../types";
import { Scraper, SearchOptions } from "./types";
import { getProviderId, isProviderId } from "../routers/manga-page";
import updateManga from "../util/updateManga";

export class manga1Class extends Scraper {
	constructor() {
		super();
		this.provider = "Manga1";
		this.searchDisplay = "Manga1";
		this.canSearch = true;
		this.nsfw = true;
	}

	public async search(query: string, options?: Partial<SearchOptions>) {
		// This is a better way of destructuring with default values
		// than doing it at the top. This took... many hours. Thanks Pandawan!

		let page = "";
		let type = "";
		let state = "";
		if (query !== "")
		{ 
		const pageDelimiterIndex = query.indexOf("/");
		if (pageDelimiterIndex !== -1) {
		  page = query.substring(pageDelimiterIndex + 1);
		  query = query.substring(0, pageDelimiterIndex);
		}
	  
		const stateDelimiterIndex = query.indexOf("&");
		if (stateDelimiterIndex !== -1) {
		  state = query.substring(stateDelimiterIndex + 1);
		  query = query.substring(0, stateDelimiterIndex);
		}
	  
		const typeDelimiterIndex = query.indexOf("?");
		if (typeDelimiterIndex !== -1) {
		  type = query.substring(typeDelimiterIndex + 1);
		  query = query.substring(0, typeDelimiterIndex);
		}
		if (query === ""){
			query = "all";
		}
		console.log(`Page: ${page}`);
		console.log(`Type: ${type}`);
		console.log(`State: ${state}`);
		console.log(`query: ${query}`);
	}

		let { resultCount } = {
			resultCount: 24,
			...options,
		};

		const genreUrls = {
			"all": "https://manganato.com/genre-all",
			"action": "https://manganato.com/genre-2/",
			"adventure": "https://manganato.com/genre-4/",
			"comedy": "https://manganato.com/genre-6/",
			"cooking": "https://manganato.com/genre-7/",
			"doujinshi": "https://manganato.com/genre-9/",
			"drama": "https://manganato.com/genre-10/",
			"erotica": "https://manganato.com/genre-48/",
			"fantasy": "https://manganato.com/genre-12/",
			"gender bender": "https://manganato.com/genre-13/",
			"harem": "https://manganato.com/genre-14/",
			"historical": "https://manganato.com/genre-15/",
			"horror": "https://manganato.com/genre-16/",
			"isekai": "https://manganato.com/genre-45/",
			"josei": "https://manganato.com/genre-17/",
			"manhua": "https://manganato.com/genre-44/",
			"manhwa": "https://manganato.com/genre-43/",
			"martial arts": "https://manganato.com/genre-19/",
			"mature": "https://manganato.com/genre-20/",
			"mecha": "https://manganato.com/genre-21/",
			"medical": "https://manganato.com/genre-22/",
			"mystery": "https://manganato.com/genre-24/",
			"one shot": "https://manganato.com/genre-25/",
			"pornographic": "https://manganato.com/genre-47/",
			"psychological": "https://manganato.com/genre-26/",
			"romance": "https://manganato.com/genre-27/",
			"school life": "https://manganato.com/genre-28/",
			"sci fi": "https://manganato.com/genre-29/",
			"seinen": "https://manganato.com/genre-30/",
			"shoujo": "https://manganato.com/genre-31/",
			"shoujo ai": "https://manganato.com/genre-32/",
			"shounen": "https://manganato.com/genre-33/",
			"shounen ai": "https://manganato.com/genre-34/",
			"slice of life": "https://manganato.com/genre-35/",
			"smut": "https://manganato.com/genre-36/",
			"sports": "https://manganato.com/genre-37/",
			"superhero": "https://manganato.com/genre-38/",
			"supernatural": "https://manganato.com/genre-39/",
			"tragedy": "https://manganato.com/genre-40/",
			"vampire": "https://manganato.com/genre-41/",
			"webtoon": "https://manganato.com/genre-42/",
		  };
		  
		  let pageUrl: string;
		  
		  if (query === "") {
			// Get popular page
			resultCount = 24;
			pageUrl = "https://manganato.com/genre-all";
		  } else if (query in genreUrls) {
			resultCount = 24;
			pageUrl = `${genreUrls[query]}/${encodeURIComponent(page)}?type=${encodeURIComponent(type)}&state=${encodeURIComponent(state)}`;
		  } else {
			pageUrl = `https://manganato.com/search/story/${encodeURIComponent(
			  query
				.replace(/[^a-zA-Z]/g, " ")
				.trim()
				.replace(/ /g, "_")
			)}`;
		  }
		  
		console.log(pageUrl);

		// Fetch DOM for relevant page
		const pageReq = await fetch(pageUrl);
		const pageHtml = await pageReq.text();

		// Get DOM for popular page
		const dom = new JSDOM(pageHtml);
		const document = dom.window.document;

		// Get nodes
		const anchors = [
			...document.querySelectorAll(".genres-item-info .a-h:first-child"),
			...document.querySelectorAll(".item-title"),
		];

		// Get IDs from nodes
		const ids = anchors
			.map((anchor) => anchor.href.split("/").pop())
			.slice(0, resultCount);

		// Get details for each search result
		const searchResultData: ScraperResponse[] = await Promise.all(
			ids.map((id) => updateManga("manga1", id))
		);

		return searchResultData;
	}

	/**
	 * The scrape function
	 */
	public async scrape(slug: string, chapterId: string) {
		// Set a timeout for how long the request is allowed to take
		const maxTimeout: Promise<ScraperError> = new Promise((resolve) => {
			setTimeout(() => {
				resolve(error(0, "This request took too long"));
			}, 25e3);
		});

		// Attempt scraping series
		const scraping = this.doScrape(slug, chapterId);

		// Get first result of either scraping or timeout
		const raceResult = await Promise.race([maxTimeout, scraping]);

		// Check if it's the timeout instead of the scraped result
		if (
			raceResult.success === false &&
			raceResult.err === "This request took too long"
		) {
			console.error(
				chalk.red("[MANGA1]") +
					` A request for '${slug}' at '${chapterId}' took too long and has timed out`
			);
		}

		// Return result
		return raceResult;
	}

	private async doScrape(
		slug: string,
		chapterId: string
	): Promise<ScraperResponse> {
		try {
			// Get HTML
			slug = slug.startsWith("manga-") ? slug : `manga-${slug}`;
			const pageReq = await fetch(`https://readmanganato.com/${slug}`);
			const pageHtml = await pageReq.text();

			// Get variables
			const dom = new JSDOM(pageHtml);
			const document = dom.window.document;

			// Get title
			const title = document.querySelector("h1").textContent;

			// Get poster URL
			let posterUrl =
				(document.querySelector(".info-image img") ?? {}).src || "";
			if (posterUrl.startsWith("/"))
				posterUrl = "https://manganato.com/" + posterUrl;

			if (!posterUrl) posterUrl = "https://jipfr.nl/jip.jpg";

			// Get genres from tags
			const genreWrapper = [
				...document.querySelectorAll(".variations-tableInfo tr"),
			].find((tr) => tr.textContent.includes("Genres"));
			const genreLinks = [...genreWrapper.querySelectorAll(".a-h")];
			const genres = genreLinks.map((v) => v.textContent);

			// Get alternate titles
			const altTitleWrapper = document.querySelector(".info-alternative")
				.parentNode.parentNode;
			const alternateTitles = altTitleWrapper
				.querySelector("h2")
				.textContent.split(";")
				.map((v) => v.trim());

			// Get status
			const statusWrapper = document.querySelector(".info-status").parentNode
				.parentNode;
			const status = statusWrapper
				.querySelectorAll("td")[1]
				.textContent.toLowerCase();

			// Get chapters
			const chapters: Chapter[] = [
				...document.querySelectorAll(".row-content-chapter li"),
			]
				.reverse() // Their default sorting is large > small — we want the opposite of that
				.map(
					(row): Chapter => {
						// Find all values
						const label = row.querySelector("a").textContent.split(":")[0];
						const slug = row
							.querySelector("a")
							.href.split("/")
							.pop()
							.replace(/-/g, "_");
						const chapter = Number(slug.split("_").pop());
						let date = new Date(row.querySelector(".chapter-time").textContent);

						// Make sure date is valid, otherwise set it to now
						// Thanks for nothing Manganelo
						if (!date.getTime()) date = new Date();

						// Return product of chapter
						return {
							label,
							// Since the creation of the Manganelo scraper, MN has replaced hyphens with underscores. We're replacing that here to keep the reading data intact
							hrefString: slug,
							season: 1,
							chapter,
							date,
							combined: chapter,
						};
					}
				);

			// Find images
			let chapterImages = [];
			if (chapterId != "-1") {
				// Scrape page to find images
				const url = `https://readmanganato.com/${slug}/${chapterId.replace(
					/_/g,
					"-" // See generation of chapter hrefString above
				)}`;
				const chapterPageReq = await fetch(url);
				const chapterPageHtml = await chapterPageReq.text();

				// JSDOM it
				const dom = new JSDOM(chapterPageHtml);
				const chapterDocument = dom.window.document;

				const images = [
					...chapterDocument.querySelectorAll(".container-chapter-reader img"),
				];
				chapterImages = images.map((v) => v.getAttribute("src"));
			}

			// Find description
			const descriptionParagraphs = document
				.querySelector("#panel-story-info-description")
				.textContent.split(" :")
				.slice(1)
				.join(" :")
				.split(/\n|<br>/g);

			// Return it.
			const providerId = getProviderId(this.provider);
			return {
				constant: {
					title,
					slug: slug.replace(/manga-/g, ""),
					posterUrl,
					alternateTitles,
					descriptionParagraphs,
					genres,
					nsfw: false,
				},
				data: {
					chapters,
					chapterImages,
					status,
				},
				success: true,
				provider: isProviderId(providerId) ? providerId : null,
			};
		} catch (err) {
			console.error(
				chalk.red("[MANGA1]") +
					` A request for '${slug}' at '${chapterId}' has errored`
			);
			return error(-1, err);
		}
	}
}

// Generate manganelo object and export it
const manga1 = new manga1Class();
export default manga1;
