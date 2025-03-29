
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
