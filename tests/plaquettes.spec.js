const { test, expect } = require("@playwright/test");

test("les 4 plaquettes PDF du Lab sont présentes (FR) et servies en 200", async ({ page, request }) => {
  await page.addInitScript(() => localStorage.setItem("lang", "fr"));
  await page.goto("./", { waitUntil: "domcontentloaded" });
  const links = page.locator("#lab-list a", { hasText: "Télécharger le PDF" });
  await expect(links).toHaveCount(4);
  const hrefs = await links.evaluateAll(as => as.map(a => a.href));
  expect(hrefs.map(h => h.split("/").pop()).sort()).toEqual([
    "Keepr_Analytics_etude_de_cas.pdf", "Keepr_dossier.pdf", "Keepy_dossier.pdf", "Moments_etude_de_cas.pdf",
  ]);
  for (const href of hrefs) {
    const res = await request.get(href);
    expect(res.status(), href).toBe(200);
    expect(res.headers()["content-type"], href).toContain("pdf");
  }
});

test("aucun lien ou ressource locale de index.html ne pointe vers un fichier absent du repo", async () => {
  const fs = require("fs"), path = require("path");
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const refs = new Set();
  for (const m of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) refs.add(m[1]);
  for (const m of html.matchAll(/content=["']https:\/\/mthlabs\.github\.io\/Portofolio\/([^"']+)["']/g)) refs.add(m[1]);
  for (const m of html.matchAll(/\bfile:"([^"]+)"/g)) refs.add(m[1]);
  const local = [...refs].filter(r => r && !/^(https?:|mailto:|tel:|data:|#|javascript:|\$\{)/.test(r));
  expect(local.length).toBeGreaterThan(0);
  const missing = local.map(r => r.split(/[?#]/)[0]).filter(r => r && !fs.existsSync(path.join(__dirname, "..", r)));
  expect(missing).toEqual([]);
});
