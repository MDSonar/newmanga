import express from "express";
const router = express.Router();

import getMangaProgress, { setMangaProgress } from "../util/getMangaProgress";
import db from "../db";
import { doSearch } from "../util/doSearch";
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
	const { popular} = await getData();


	res.render("popular", {
		//letest,
		popular,
		isPopular: true,
	});
});

router.post("/dismiss-announcement", (req, res) => {
	const dismissedAnnouncements = db.get("other.announcements-dismissed") || [];
	const { id } = req.body;

	if (!dismissedAnnouncements.includes(id)) dismissedAnnouncements.push(id);

	db.set("other.announcements-dismissed", dismissedAnnouncements);

	res.json({
		status: 200,
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
			resultCount: 50,
		}); // Empty search sorts by popular

	// Set progress for popular manga
	if (Array.isArray(popular)) {
		await Promise.all(popular.map(setMangaProgress));
	}

	return { popular};
}

export default router;