import { Navigate, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { SaveAccount } from "../components/SaveAccount";
import { useSession } from "../lib/auth-client";

/** Standalone "save your account" route — used by the guest nudge in the You tab. */
export default function Save() {
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();
  const isGuest = Boolean((session?.user as { isAnonymous?: boolean } | undefined)?.isAnonymous);

  if (isPending) return null;
  // not a guest (already has an account, or signed out) → nothing to upgrade
  if (!session) return <Navigate to="/login" replace />;
  if (!isGuest) return <Navigate to="/app/you" replace />;

  return (
    <AuthLayout>
      <SaveAccount
        heading="Save your account"
        sub="Add an email and password so you never lose your matches."
        onDone={() => navigate("/app/you")}
        onSkip={() => navigate("/app/you")}
      />
    </AuthLayout>
  );
}
