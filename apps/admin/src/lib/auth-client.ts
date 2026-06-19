import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

// Same-origin (Vite proxy forwards /api/auth/* to the API) → httpOnly cookie session.
export const authClient = createAuthClient({
  plugins: [adminClient()],
});

export const useSession = authClient.useSession;
