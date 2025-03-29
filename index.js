
// 29/3/2025 Using PlayWright
const express = require('express');
const { chromium } = require('playwright');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Function to scrape movies from TMDb
async function scrapeMovies() {
    const browser = await chromium.launch({
        headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",  // Prevents Render memory issues
                "--disable-gpu",            // Disables GPU acceleration
                "--disable-background-timer-throttling",
                "--disable-backgrounding-occluded-windows",
                "--disable-renderer-backgrounding"
            ],
        executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined // Use Render’s Chromium
    });
    const page = await browser.newPage();
    const url = `https://www.themoviedb.org/movie/`;
    await page.goto(url, { waitUntil: 'domcontentloaded' ,
        timeout: 60000});
    const movies = await page.evaluate(() => {
        const elements = document.querySelectorAll('.card.style_1');
        return Array.from(elements).map(el => {
            const title = el.querySelector('.content h2 a')?.textContent.trim() || null;
            const rating = el.querySelector('.user_score_chart')?.getAttribute('data-percent') || null;
            const url = el.querySelector('.content h2 a') ? 'https://www.themoviedb.org' + el.querySelector('.content h2 a').getAttribute('href') : null;
            const img = el.querySelector('img.poster')?.getAttribute('src') ||
                el.querySelector('.wrapper img')?.getAttribute('data-src') || null;
            const time = el.querySelector('.content p')?.textContent.trim() || null;

            return (title && url && img && time) ? { title, rating, url, img, time } : null;
        }).filter(movie => movie !== null);
    });

    await browser.close();
    return movies;
}

// API Route
app.get('/', async (req, res) => {
    try {
        const movies = await scrapeMovies();
        if (!movies.length) {
            return res.status(404).json({ error: 'No movies found!' });
        }
        res.json({ success: 'ok', movies });
    } catch (error) {
        console.error("Error scraping movies:", error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

//app.listen(PORT, () => {
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

module.exports = scrapeMovies;


