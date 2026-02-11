import { test, expect } from "@playwright/test";

test("initial placement: key pieces are visible in expected cells", async ({ page }) => {
  await page.goto("/");

  // Roi noirs / blancs
  await expect(page.getByTestId("cell-r0-c4").getByTestId("piece-black-king-r0-c4")).toBeVisible();
  await expect(page.getByTestId("cell-r7-c4").getByTestId("piece-white-king-r7-c4")).toBeVisible();

  // Dames
  await expect(page.getByTestId("cell-r0-c3").getByTestId("piece-black-queen-r0-c3")).toBeVisible();
  await expect(page.getByTestId("cell-r7-c3").getByTestId("piece-white-queen-r7-c3")).toBeVisible();

  // Pions (exemples)
  await expect(page.getByTestId("cell-r1-c0").getByTestId("piece-black-pawn-r1-c0")).toBeVisible();
  await expect(page.getByTestId("cell-r6-c7").getByTestId("piece-white-pawn-r6-c7")).toBeVisible();
});

test("user can move a piece legally by clicking source then destination", async ({ page }) => {
  await page.goto("/");

  // Déplacer le pion blanc de e2 (6,4) vers e4 (4,4) — coup légal
  await page.getByTestId("cell-r6-c4").click();
  await page.getByTestId("cell-r4-c4").click();

  // Vérifier que la pièce est arrivée
  await expect(page.getByTestId("piece-white-pawn-r4-c4")).toBeVisible();
  // Vérifier que la source est vide
  await expect(page.getByTestId("cell-r6-c4").locator(".piece")).toHaveCount(0);
});

test("illegal moves are rejected", async ({ page }) => {
  await page.goto("/");

  // Tenter de déplacer le pion blanc de a2 (6,0) vers a5 (3,0) — illégal
  await page.getByTestId("cell-r6-c0").click();
  await page.getByTestId("cell-r3-c0").click();

  // Le pion doit toujours être en a2
  await expect(page.getByTestId("piece-white-pawn-r6-c0")).toBeVisible();
  // Et a5 doit être vide
  await expect(page.getByTestId("cell-r3-c0").locator(".piece")).toHaveCount(0);
});

test("history updates after a legal move", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("cell-r6-c4").click();
  await page.getByTestId("cell-r4-c4").click();

  // ton UI affiche "Historique des mouvements (X)"
  await expect(page.getByText(/Historique des mouvements \(\d+\)/)).toBeVisible();
  await expect(page.getByText(/Pion/i)).toBeVisible(); // "Pion e2 → e4" etc.
});
