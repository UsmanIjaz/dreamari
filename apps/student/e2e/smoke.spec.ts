import { test, expect } from "@playwright/test";

const ORIGIN = "http://localhost:5173"; // dev server (proxies /api + /v1 to the API)

/**
 * Smoke test of the cookie-auth app. Creates a Better Auth guest session in the
 * browser context (so the httpOnly cookie is set), seeds a BUILD, then asserts the
 * shell renders live API data and the swipe flow opens.
 */
test("guest session renders the shell from the API, and a world opens the vibe check", async ({ page }) => {
  // anonymous guest sign-in -> session cookie stored in the browser context
  await page.request.post(`${ORIGIN}/api/auth/sign-in/anonymous`, { data: {} });
  await page.request.put(`${ORIGIN}/v1/build`, {
    data: {
      grade: "12th grade",
      subjects: ["Computer Science", "Mathematics", "Science"],
      strengths: ["Problem solving", "Technology"],
      days: ["Solve problems", "Build things"],
      values: ["Income", "Creativity"],
      years: "4 years",
      finance: "Not a concern",
      pathPref: "college",
    },
  });

  await page.emulateMedia({ reducedMotion: "reduce" });

  // Home renders the dashboard from /match + /swipes (cookie auth)
  await page.goto("/app/home");
  await expect(page.getByText("Dream Score")).toBeVisible();

  // Explore renders the Dream Map worlds from /match/deck
  await page.goto("/app/explore");
  await expect(page.getByRole("heading", { name: /Where to first/i })).toBeVisible();
  const world = page.getByRole("button", { name: /Explore Computer Science/i });
  await expect(world).toBeVisible();

  // tapping a world opens the gamified transition, then the vibe-check questions
  await world.click();
  await expect(page.getByText(/vibe check/i)).toBeVisible();
  await expect(page.getByText(/Sound like classes you'd actually enjoy/i)).toBeVisible();
});

/** A returning student creates an account, then logs back in through the UI. */
test("a student can create an account and log back in", async ({ page }) => {
  const email = `e2e_login_${Date.now()}@demo.test`;
  const password = "e2elogin123";
  // create a real account (sets the session cookie in this context)
  const res = await page.request.post(`${ORIGIN}/api/auth/sign-up/email`, {
    data: { email, password, name: "E2E Login" },
    headers: { origin: ORIGIN },
  });
  expect(res.ok()).toBeTruthy();
  // log out so we exercise the real login screen
  await page.context().clearCookies();

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/login");
  await page.getByPlaceholder("you@email.com").fill(email);
  await page.getByPlaceholder("Your password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();

  // successful login lands inside the app shell
  await page.waitForURL("**/app/**");
});
