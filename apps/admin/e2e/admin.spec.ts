import { test, expect } from "@playwright/test";

/** Drives the real admin UI: login → overview → students → create an invite. */
test("admin signs in, sees the dashboard + roster, and creates an invite", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("dreamari123").fill("dreamari123"); // email is pre-filled with the seed admin
  await page.getByRole("button", { name: "Sign in" }).click();

  // Overview renders from /v1/admin/analytics
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(page.getByText("Most-liked majors")).toBeVisible();

  // Students roster renders from /v1/admin/students (the seed personas)
  await page.getByRole("link", { name: "Students", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Students" })).toBeVisible();
  await expect(page.getByText("Maya")).toBeVisible();

  // Invites: create one and see it appear
  await page.getByRole("link", { name: "Invites", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Invites" })).toBeVisible();
  await page.getByPlaceholder("e.g. Jordan").fill("E2E Tester");
  await page.getByPlaceholder("student@email.com").fill("e2e-tester@example.com");
  await page.getByRole("button", { name: "Create invite" }).click();
  await expect(page.getByText("E2E Tester")).toBeVisible();
});

test("admin can create a school, add a grade, and bulk-invite a roster", async ({ page }) => {
  const schoolName = `E2E School ${Date.now()}`;
  await page.goto("/login");
  await page.getByPlaceholder("dreamari123").fill("dreamari123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();

  // create a school
  await page.getByRole("link", { name: "Schools", exact: true }).click();
  await page.getByPlaceholder("e.g. Westfield High").fill(schoolName);
  await page.getByRole("button", { name: "Add school" }).click();
  await page.getByText(schoolName).click();
  await expect(page.getByRole("heading", { name: schoolName })).toBeVisible();

  // add a grade (cohort)
  await page.getByPlaceholder(/9th grade/).fill("E2E Grade 9");
  await page.getByRole("button", { name: "Add grade" }).click();
  await expect(page.getByText("E2E Grade 9")).toBeVisible();

  // bulk roster upload → 3 invites
  await page.getByRole("button", { name: "Bulk roster" }).click();
  await page.getByPlaceholder(/Maya/).fill("Ada, ada@example.com\nGrace, grace@example.com\nHedy, hedy@example.com");
  await page.getByRole("button", { name: /Generate/ }).click();
  await expect(page.getByText(/3 invites/)).toBeVisible();
});
