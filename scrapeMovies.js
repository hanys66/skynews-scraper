const puppeteer = require("puppeteer");
async function scrapeMovies() {
    const browser = await puppeteer.launch({
        headless: "true",//new

        //executablePath:"C:\\tmp\\puppeteer-cache\\chrome\\win64-134.0.6998.35\\chrome-win64\\chrome.exe",
        //  executablePath:"Process.env.PUPPETEER_EXECUTABLE_PATH",
        args: ['--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ],

    });
    const page = await browser.newPage();
    await page.goto("https://www.themoviedb.org/movie", { waitUntil: "domcontentloaded" });

    const movies = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".card")).map(movie => ({
            title: movie.querySelector("h2 a")?.innerText.trim() || "No Title",
            url: movie.querySelector("h2 a")?.href || "No URL"
        }));
    });
    await browser.close();
    return movies;
}
// If run directly, test the scraper
if (require.main === module) {
    scrapeMovies().then(console.log).catch(console.error);
}
module.exports = scrapeMovies;