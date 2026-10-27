
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Careers from "./pages/Careers";
import CareerDetails from "./pages/CareerDetails";
import SkillGap from "./pages/SkillGap";
import JobAnalyzer from "./pages/JobAnalyzer";
import Roadmap from "./pages/Roadmap";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import CVGenerator from "./pages/CVGenerator";
import JobApplicationTracker from "./pages/JobApplicationTracker";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/careers/:id" element={<CareerDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Pages that require login */}
          <Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/skill-gap" element={<SkillGap />} />
  <Route path="/job-analyzer" element={<JobAnalyzer />} />
  <Route path="/roadmap" element={<Roadmap />} />
  <Route path="/profile" element={<Profile />} />
    <Route path="/cv-generator" element={<CVGenerator />} />
<Route
  path="/job-applications"
  element={<JobApplicationTracker />}
/>
</Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
