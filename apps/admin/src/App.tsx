import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./routes/Login";
import AdminShell from "./layout/AdminShell";
import Overview from "./routes/Overview";
import Students from "./routes/Students";
import StudentDetail from "./routes/StudentDetail";
import Invites from "./routes/Invites";
import Schools from "./routes/Schools";
import SchoolDetail from "./routes/SchoolDetail";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<AdminShell />}>
        <Route index element={<Overview />} />
        <Route path="schools" element={<Schools />} />
        <Route path="schools/:id" element={<SchoolDetail />} />
        <Route path="students" element={<Students />} />
        <Route path="students/:id" element={<StudentDetail />} />
        <Route path="invites" element={<Invites />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
