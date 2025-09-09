
// Login credentials
const username = "a"
const password = "b"

const TO = 30000

const remoteExecutablePath = "https://github.com/Sparticuz/chromium/releases/download/v138.0.2/chromium-v138.0.2-pack.x64.tar"

async function getQuotes(pgnum: number) {
  const url = pgnum ? `https://quotes.toscrape.com/page/${pgnum}/` : `https://quotes.toscrape.com/`
  console.log(`Request URL to scrape ${url}`)

   try {
    process.env.VERCEL_ENV = "true"
    const isVercel = !!process.env.VERCEL_ENV;
    let puppeteer: any,
      launchOptions: any = {
        headless: true,
      };

    if (isVercel) {
      const chromium = (await import("@sparticuz/chromium")).default;
      puppeteer = await import("puppeteer-core");
      launchOptions = {
        ...launchOptions,
        args: chromium.args,
        executablePath: await chromium.executablePath(remoteExecutablePath),
      };
    } else {
      puppeteer = await import("puppeteer");
    }

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TO });

    try {
      // If not logged in, click login link
      if (await page.$('a[href="/login"]')) {
        await page.click('a[href="/login"]');
        await page.waitForSelector('input[name="username"]');

        await page.type('input[name="username"]', username);
        await page.type('input[name="password"]', password);
        await page.click('input[type="submit"]');
        
        await page.waitForSelector('a[href="/logout"]', { timeout: TO });

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TO });
      }

      // Scrape quotes
      const quotes = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".quote")).map((el) => ({
          text: el.querySelector(".text")?.innerHTML || "",
          author: el.querySelector(".author")?.innerHTML || "",
          tags: Array.from(el.querySelectorAll(".tags .tag")).map((t) => t.innerHTML),
        }));
      });

      // Throw an error if no quotes found, probably a change in the endpoint or service outage
      if (!quotes || quotes.length === 0) {
        throw new Error("No quotes found on page.");
      }
      return quotes;

    } catch (err) {
      const currentUrl = page.url();
      console.log("Current URL when timeout occurred:", currentUrl);
      throw err
    } finally {
      await browser.close();
    }
   } catch (err) {
    console.log(`Err: `, err)
    throw err
   }
}

// In-memory cache
const cache: any = {};
let lastFetchTime = null;

const CACHE_TTL_MS = 120 * 60 * 1000;

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams

  const pg = parseInt(params.get('page') || '')
  const cacheKey = `page-${pg}`;

  try {
    const now = Date.now();

    if (!(pg >= 1 && pg <= 10)) { throw new Error("Invalid page number") }

    // If no cache yet or cache expired -> fetch again
    if (
      !cache[cacheKey] ||
      now - cache[cacheKey].timestamp > CACHE_TTL_MS
    ) {
      console.log(`⏳ Fetching fresh quotes for ${pg}...`);
      const data = await getQuotes(pg);
      cache[cacheKey] = { data, timestamp: now };
      lastFetchTime = now;
    } else {
      console.log(`✅ Returning cached quotes for ${pg}`);
    }

    return new Response(JSON.stringify(cache[cacheKey].data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    console.log("Main Error")
    console.log(err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

}


  