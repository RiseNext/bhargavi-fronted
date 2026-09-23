/** Viewport-sized crops at given scroll offsets, for readable review. */
import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";

const [, , BASE = "http://localhost:3111", OUT = "./.audit/crops", ROUTE = "/"] =
  process.argv;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

const SHOTS = [
  { w: 390, h: 800, offsets: [0, 780, 1700, 2700, 3900] },
  { w: 1440, h: 900, offsets: [0, 900, 1900, 2900, 4100] },
];

const run = async () => {
  await mkdir(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--hide-scrollbars", "--disable-gpu"],
  });

  for (const { w, h, offsets } of SHOTS) {
    const page = await browser.newPage();
    await page.setViewport({
      width: w,
      height: h,
      deviceScaleFactor: 1,
      isMobile: w < 768,
    });
    await page.goto(BASE + ROUTE, { waitUntil: "networkidle0", timeout: 45000 });
    await page.evaluate(() =>
      document
        .querySelectorAll(".reveal, .wipe")
        .forEach((el) => el.setAttribute("data-shown", "true")),
    );

    for (const y of offsets) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await new Promise((r) => setTimeout(r, 450));
      await page.screenshot({ path: `${OUT}/${w}-y${y}.png` });
    }
    await page.close();
  }

  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
