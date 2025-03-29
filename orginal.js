// the Original
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
