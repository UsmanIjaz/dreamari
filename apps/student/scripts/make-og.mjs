// Renders the social-share card to a real PNG (WhatsApp/Facebook/LinkedIn need raster, not SVG).
// Run: node apps/student/scripts/make-og.mjs   (writes apps/student/public/og-image.png)
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  ({ chromium } = await import("@playwright/test"));
}

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "../public/og-image.png");

const mascot = `
<svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <circle cx="150" cy="152" r="118" fill="#fff" stroke="#14271d" stroke-width="9"/>
  <circle cx="116" cy="142" r="16" fill="#14271d"/>
  <circle cx="184" cy="142" r="16" fill="#14271d"/>
  <circle cx="109" cy="134" r="5.5" fill="#fff"/>
  <circle cx="177" cy="134" r="5.5" fill="#fff"/>
  <path d="M126 182 H174 A24 24 0 0 1 126 182 Z" fill="#e07a4f"/>
  <rect x="224" y="44" width="46" height="46" rx="10" fill="#f4c531" stroke="#14271d" stroke-width="7" transform="rotate(45 247 67)"/>
</svg>`;

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1200px;height:630px}
  .card{width:1200px;height:630px;position:relative;overflow:hidden;background:#1e9d6f;
    font-family:'Plus Jakarta Sans',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center}
  .glow{position:absolute;width:760px;height:760px;right:-160px;top:-180px;border-radius:50%;
    background:radial-gradient(circle,rgba(255,255,255,.14),transparent 70%)}
  .s{position:absolute;border:5px solid #14271d}
  .left{padding-left:92px;max-width:700px;z-index:3}
  .brand{display:flex;align-items:center;gap:13px;margin-bottom:36px}
  .brand .dot{width:34px;height:34px;border-radius:10px;background:#fff;border:4px solid #14271d;
    display:flex;align-items:center;justify-content:center;gap:5px}
  .brand .dot i{width:5px;height:5px;border-radius:50%;background:#14271d;display:block}
  .brand b{color:#fff;font-weight:800;font-size:36px;letter-spacing:-.5px}
  h1{color:#fff;font-weight:800;font-size:82px;line-height:1.03;letter-spacing:-3px}
  h1 .hl{position:relative;white-space:nowrap}
  h1 .hl::after{content:"";position:absolute;left:-2px;right:-2px;bottom:9px;height:22px;background:#f4c531;border-radius:999px;z-index:-1}
  p{color:#e7f6ec;font-weight:600;font-size:31px;margin-top:30px;max-width:540px;line-height:1.35}
  .mascot{position:absolute;right:86px;top:50%;transform:translateY(-50%);z-index:2}
</style></head>
<body>
  <div class="card">
    <div class="glow"></div>
    <span class="s" style="left:60px;top:96px;width:26px;height:26px;border-radius:50%;background:#f4c531"></span>
    <span class="s" style="left:34px;top:470px;width:30px;height:30px;border-radius:7px;background:#fff;transform:rotate(-12deg)"></span>
    <span class="s" style="left:560px;bottom:70px;width:22px;height:22px;border-radius:50%;background:#e07a4f"></span>
    <span class="s" style="right:300px;top:70px;width:26px;height:26px;border-radius:7px;background:#f4c531;transform:rotate(16deg)"></span>
    <div class="left">
      <div class="brand"><span class="dot"><i></i><i></i></span><b>Dreamari</b></div>
      <h1>Dream your <span class="hl">future</span> now.</h1>
      <p>Discover careers that actually feel like you.</p>
    </div>
    <div class="mascot">${mascot}</div>
  </div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: "load" });
try {
  await Promise.race([page.evaluate(() => document.fonts.ready), new Promise((r) => setTimeout(r, 3500))]);
} catch {
  /* fonts optional; system fallback is fine */
}
await page.waitForTimeout(250);
await page.locator(".card").screenshot({ path: out });
await browser.close();
console.log("wrote", out);
