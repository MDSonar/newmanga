import express from "express";
const router = express.Router();

import db from "../db";
import { doSearch } from "../util/doSearch";
import secretConfig from "../util/secretConfig";
import { SearchError } from "../scrapers/types";
import { ScraperResponse } from "../types";
import { doMangadexMigration } from "../util/migrateMangadex";

router.get("/", async (req, res) => {
	// Set host
	const url = `http://${req.headers.host}/`;
	db.set("other.host", url);

	// Ensure MangaDex migration and do so if not done yet
	await doMangadexMigration();

	// Get all data neccesary
	const {letests, popular } = await getData();


	res.render("home", {
		letests,
		popular,
		isHome: true,
	});
});



router.get("/json", async (req, res) => {
	res.header("Access-Control-Allow-Origin", "*");
	const data = await getData();
	res.json({ data });
});

async function getData() {



	let popular: ScraperResponse[] | SearchError = [];
		popular = await doSearch("mangasee", "", {
			resultCount: 24,
		}); // Empty search sorts by popular

	let letests: ScraperResponse[] | SearchError = [];
	letests = await doSearch("manganelo", "", {
			resultCount: 24,
		}); // Empty search sorts by popular

	// Set progress for popular manga

	return { popular, letests};
}

export default router;
