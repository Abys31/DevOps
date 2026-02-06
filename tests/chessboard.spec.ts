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

test("user can move a piece by clicking source then destination (free move)", async ({ page }) => {
  await page.goto("/");

  // Déplacer le pion blanc de (6,0) vers (4,0)
  await page.getByTestId("cell-r6-c0").click();
  await page.getByTestId("cell-r4-c0").click();

  // Vérifier que la pièce est arrivée
  await expect(page.getByTestId("piece-white-pawn-r4-c0")).toBeVisible();
  // Vérifier que la source est vide (plus de pièce)
  await expect(page.getByTestId("cell-r6-c0").locator(".piece")).toHaveCount(0);
});

test("user can capture/replace by clicking destination occupied cell", async ({ page }) => {
  await page.goto("/");

  // Déplacer le pion blanc (6,0) sur un pion noir (1,0) -> remplacement
  await page.getByTestId("cell-r6-c0").click();
  await page.getByTestId("cell-r1-c0").click();

  // La case contient maintenant un pion blanc
  await expect(page.getByTestId("piece-white-pawn-r1-c0")).toBeVisible();

  // Et plus de pion noir sur cette case
  await expect(page.getByTestId("cell-r1-c0").locator('[data-testid^="piece-black-pawn"]')).toHaveCount(0);
});

test("history updates after a move", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("cell-r6-c0").click();
  await page.getByTestId("cell-r4-c0").click();

  // ton UI affiche "Historique des mouvements (X)"
  await expect(page.getByText(/Historique des mouvements \(\d+\)/)).toBeVisible();
  await expect(page.getByText(/Pion/i)).toBeVisible(); // "Pion a2 → a4" etc.
});
