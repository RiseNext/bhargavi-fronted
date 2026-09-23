/**
 * Responsive audit + screenshots.
 * Drives real Chrome with device-metrics emulation (not just a resized
 * window, which Chrome clamps to a minimum width on Windows).
 *
 *   node scripts/audit.mjs [baseUrl] [outDir]
 */
import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";

const BASE = process.argv[2] ?? "http://localhost:3111";
const OUT = process.argv[3] ?? "./.audit";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

const WIDTHS = [320, 390, 480, 768, 1024, 1280, 1440];
const ROUTES = [
  ["home", "/"],
  ["about", "/about"],
  ["services", "/services"],
  ["service", "/services/acupuncture"],
  ["testimonials", "/testimonials"],
  ["gallery", "/gallery"],
  ["videos", "/videos"],
  ["blog", "/blog"],
  ["contact", "/contact"],
  ["404", "/no-such-page"],
];

/** Elements whose box sticks out past the viewport's right/left edge. */
const findOverflow = () => {
  const vw = document.documentElement.clientWidth;
  const bad = [];
  for (const el of document.querySelectorAll("body *")) {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") continue;
    if (s.position === "fixed") continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    // Ignore anything inside a horizontal scroller — it is meant to overflow.
    if (el.closest(".rail, .marquee, [data-allow-overflow]")) continue;
    const over = Math.round(Math.max(r.right - vw, -r.left));
    if (over > 1) {
      bad.push({
        over,
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute("class") || "").slice(0, 110),
      });
    }
  }
  return {
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: vw,
    offenders: bad.sort((a, b) => b.over - a.over).slice(0, 6),
  };
};

const run = async () => {
  await mkdir(OUT, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--hide-scrollbars", "--disable-gpu"],
  });

  let failures = 0;

  for (const [name, path] of ROUTES) {
    for (const width of WIDTHS) {
      const page = await browser.newPage();
      await page.setViewport({
        width,
        height: 900,
        deviceScaleFactor: 1,
        isMobile: width < 768,
        hasTouch: width < 768,
      });
      await page.goto(BASE + path, { waitUntil: "networkidle0", timeout: 45000 });
      // Force every scroll-reveal into its final state so nothing is mid-animation.
      await page.evaluate(() => {
        document
          .querySelectorAll(".reveal, .wipe")
          .forEach((el) => el.setAttribute("data-shown", "true"));
      });
      await new Promise((r) => setTimeout(r, 350));

      const res = await page.evaluate(findOverflow);
      const overflow = res.scrollWidth - res.clientWidth;

      if (overflow > 1) {
        failures++;
        console.log(`\n✗ ${name} @ ${width}px — scrollWidth ${res.scrollWidth} (+${overflow})`);
        for (const o of res.offenders) {
          console.log(`    +${o.over}px  <${o.tag}> ${o.cls}`);
        }
      } else {
        console.log(`✓ ${name} @ ${width}px`);
      }

      // Full-page screenshots only at the two reference widths.
      if (width === 390 || width === 1440) {
        await page.screenshot({
          path: `${OUT}/${name}-${width}.png`,
          fullPage: true,
        });
      }
      await page.close();
    }
  }

  await browser.close();
  console.log(
    failures ? `\n${failures} viewport(s) overflow.` : `\nNo horizontal overflow anywhere.`,
  );
  process.exit(failures ? 1 : 0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
