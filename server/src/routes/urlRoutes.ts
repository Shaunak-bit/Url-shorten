import { Router, Request, Response } from "express";
import Url from "../models/url"; // Updated to match the file name
import { customAlphabet } from "nanoid";

const router = Router();

// nanoid: 62-char alphabet, length 6 → looks like "aZ31rb"
const nanoid = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  6
);

// 🔧 Helper: normalize URLs (add https:// if missing)
function normalizeUrl(input: string): string {
  let u = input.trim();
  if (!/^https?:\/\//i.test(u)) {
    u = "https://" + u;
  }
  return u;
}

// 🔧 Define BASE_URL once
const BASE_URL = (() => {
  const base = process.env.BASE_URL;
  const port = process.env.PORT || 5000;
  return base || `http://localhost:${port}`;
})();

/**
 * 🟢 POST /shorten
 * body: { originalUrl: string, title?: string }
 * returns: the stored URL doc + shortUrl
 */
router.post("/shorten", async (req: Request, res: Response) => {
  try {
    const { originalUrl, title } = req.body as {
      originalUrl?: string;
      title?: string;
    };

    if (!originalUrl || typeof originalUrl !== "string") {
      return res.status(400).json({ error: "originalUrl is required" });
    }

    const normalized = normalizeUrl(originalUrl);

    // Optional: reuse if same originalUrl already exists
    const existing = await Url.findOne({ originalUrl: normalized }).lean();
    if (existing) {
      return res.json({
        ...existing,
        shortUrl: `${BASE_URL}/${existing.shortCode}`,
      });
    }

    // 🟢 Auto-generate title if not provided
    let finalTitle = title?.trim();
    if (!finalTitle) {
      try {
        const u = new URL(normalized);
        finalTitle = u.hostname.replace("www.", ""); // e.g. google.com
      } catch {
        finalTitle = "Untitled";
      }
    }

    const shortCode = nanoid();
    const doc = await Url.create({
      title: finalTitle,
      originalUrl: normalized,
      shortCode,
    });

    return res.status(201).json({
      ...doc.toObject(),
      shortUrl: `${BASE_URL}/${shortCode}`,
    });
  } catch (err) {
    console.error("POST /shorten error:", err);
    return res.status(500).json({ error: "Server error while shortening URL." });
  }
});

/**
 * 🟡 GET /admin/urls
 * Returns list of all URLs with shortUrl
 */
router.get("/admin/urls", async (_req: Request, res: Response) => {
  try {
    const items = await Url.find().sort({ createdAt: -1 }).lean();
    console.log("Fetched URLs:", items); // Logging the fetched URLs

    const withShortUrls = items.map((item) => ({
      ...item,
      shortUrl: `${BASE_URL}/${item.shortCode}`,
    }));

    return res.json(withShortUrls);
  } catch (err) {
    console.error("GET /admin/urls error:", err);
    return res.status(500).json({ error: "Failed to fetch all links." });
  }
});

/**
 * 🟢 GET /recent
 * Returns the 10 most-recently-created short links
 */
router.get("/recent", async (_req: Request, res: Response) => {
  try {
    const links = await Url.find()
      .sort({ createdAt: -1 }) // newest first
      .limit(10)               // last 10 only
      .lean();

    const withShortUrls = links.map((l) => ({
      ...l,
      shortUrl: `${BASE_URL}/${l.shortCode}`,
    }));

    return res.json(withShortUrls);
  } catch (err) {
    console.error("GET /recent error:", err);
    return res.status(500).json({ error: "Failed to fetch recent links" });
  }
});

/**
 * 🟢 GET /:shortCode
 * Redirects to the original URL and increments clicks.
 * IMPORTANT: This must be the last GET route to avoid capturing other routes.
 */
router.get("/:shortCode", async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params;
    const doc = await Url.findOne({ shortCode });

    if (!doc) {
      return res.status(404).send("Short URL not found");
    }

    doc.clicks += 1;
    doc.lastClicked = new Date();
    await doc.save();

    return res.redirect(302, doc.originalUrl);
  } catch (err) {
    console.error("GET /:shortCode error:", err);
    return res.status(500).send("Server error");
  }
});

export default router;
