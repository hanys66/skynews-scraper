/*
const puppeteer = require("puppeteer");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000; // Use Heroku-assigned port

app.get("/", async (req, res) => {
    try {
        // Launch Puppeteer
        const browser = await puppeteer.launch({
            headless: "new", // Use the latest headless mode
            args: ["--no-sandbox", "--disable-setuid-sandbox"], // Required for Heroku
        });

        // Open a new page
        const page = await browser.newPage();

        // Navigate to Sky News
        await page.goto("https://www.skynews.com", { waitUntil: "domcontentloaded" });

        // Scrape headlines
        const headlines = await page.evaluate(() => {
            return Array.from(document.querySelectorAll("h3")).map(article => article.innerText.trim());
        });

        // Close the browser
        await browser.close();

        // Send JSON response
        res.json({ success: true, headlines });
    } catch (error) {
        console.error("Error during scraping:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
*/
// 26-3-2025
//Using puppeteer
/*

const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Function to scrape movies from TMDb
async function scrapeMovies() {
    const browser = await puppeteer.launch({
         headless: 'new', // Latest headless mode
        //executablePath: "'/usr/bin",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    const url = `https://www.themoviedb.org/movie/`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });

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
        }).filter(movie => movie !== null); // Remove null values
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

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

module.exports = scrapeMovies;
*/

// 29/3/2025 USING Cheerio
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Function to scrape movies from TMDb using Cheerio
async function scrapeMovies() {
    try {
        const url = `https://www.themoviedb.org/movie/`;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const movies = [];

        $('.card.style_1').each((index, el) => {
            const title = $(el).find('.content h2 a').text().trim() || null;
            const rating = $(el).find('.user_score_chart').attr('data-percent') || null;
            const movieUrl = $(el).find('.content h2 a').attr('href') ? `https://www.themoviedb.org${$(el).find('.content h2 a').attr('href')}` : null;
            const img = $(el).find('img.poster').attr('src') || $(el).find('.wrapper img').attr('data-src') || null;
            const time = $(el).find('.content p').text().trim() || null;

            if (title && movieUrl && img && time) {
                movies.push({ title, rating, url: movieUrl, img, time });
            }
        });

        return movies;
    } catch (error) {
        console.error("Error scraping movies:", error);
        return [];
    }
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

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

module.exports = scrapeMovies;
