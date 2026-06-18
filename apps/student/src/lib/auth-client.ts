import { createAuthClient } from "better-auth/react";
import { anonymousClient, adminClient } from "better-auth/client/plugins";

/**
 * Better Auth client. baseURL defaults to the current origin, and the Vite proxy
 * forwards /api/auth/* to the API — so the session cookie stays same-origin.
 */
export const authClient = createAuthClient({
  plugins: [anonymousClient(), adminClient()],
});

export const useSession = authClient.useSession;
