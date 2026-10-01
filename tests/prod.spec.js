const { test, expect } = require("@playwright/test");

test.skip(!process.env.BASE_URL, "vérif prod : nécessite BASE_URL");

const EXPECTED = {
  fr: { Keepr: "Plaquette", "Keepr Analytics": "Étude de cas", Moments: "Étude de cas", Keepy: "Dossier" },
  en: { Keepr: "Brief", "Keepr Analytics": "Case study", Moments: "Case study", Keepy: "Dossier" },
};

for (const lang of ["fr", "en"]) {
  test(`prod : Lab ${lang.toUpperCase()}, 4 plaquettes et PDF en 200`, async ({ page, request }, testInfo) => {
    await page.addInitScript(l => localStorage.setItem("lang", l), lang);
    // Le CDN Pages peut servir l'ancienne version quelques minutes : on réessaie.
    await expect.poll(async () => {
      await page.goto("./?v=" + Date.now(), { waitUntil: "domcontentloaded" });
      return page.locator("#lab-list .keepr-plaquette a").count();
    }, { timeout: 240_000, intervals: [10_000] }).toBe(4);

    const cards = await page.locator("#lab-list article").evaluateAll(as => as.map(a => ({
      title: a.querySelector("h3").innerText.trim(),
      kicker: a.querySelector(".keepr-plaquette-kicker")?.textContent || null,
      href: a.querySelector(".keepr-plaquette a")?.href || null,
    })));
    for (const [name, kicker] of Object.entries(EXPECTED[lang])) {
      const c = cards.find(x => x.title.endsWith(name));
      expect(c, name).toBeTruthy();
      expect(c.kicker, name).toBe(kicker);
    }
    for (const c of cards.filter(x => x.href)) {
      const res = await request.get(c.href);
      expect(res.status(), c.href).toBe(200);
      expect(res.headers()["content-type"], c.href).toContain("pdf");
    }
    for (const f of ["og-image.png", "apple-touch-icon.png"]) {
      const res = await request.get(f);
      expect(res.status(), f).toBe(200);
    }
    await page.locator("#lab-list").scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`lab-${lang}.png`) });
    console.log(JSON.stringify({ lang, cards }));
  });
}
