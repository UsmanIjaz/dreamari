import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./landing/Landing";
import Onboarding from "./onboarding/Onboarding";
import Login from "./routes/Login";
import Invite from "./routes/Invite";
import Save from "./routes/Save";
import ResetPassword from "./routes/ResetPassword";
import Shell from "./shell/Shell";
import Home from "./shell/Home";
import Explore from "./match/Match";
import Play from "./shell/Play";
import You from "./shell/You";
import Career from "./shell/Career";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/invite/:code" element={<Invite />} />
      <Route path="/save" element={<Save />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* the tabbed app shell */}
      <Route path="/app" element={<Shell />}>
        <Route index element={<Navigate to="/app/home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="play" element={<Play />} />
        <Route path="you" element={<You />} />
        <Route path="career/:code" element={<Career />} />
        <Route path="*" element={<Navigate to="/app/home" replace />} />
      </Route>

      {/* legacy aliases */}
      <Route path="/match" element={<Navigate to="/app/explore" replace />} />
      <Route path="/report" element={<Navigate to="/app/you" replace />} />
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
