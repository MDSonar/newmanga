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
	const { popular } = await getData();


	res.render("home", {
		//letest,
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


	// Get popular manga
	const maxReading = Number(
		process.env.MAXREADINGTOSHOWPOPULAR ??
			secretConfig.max_reading_to_show_popular ??
			10
	);

	let popular: ScraperResponse[] | SearchError = [];
		popular = await doSearch("manganelo", "", {
			resultCount: 24,
		}); // Empty search sorts by popular
	

	// Set progress for popular manga

	return { popular};
}

export default router;
