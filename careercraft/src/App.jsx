
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Careers from "./pages/Careers";
import CareerDetails from "./pages/CareerDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";
import DashboardLayout from "./components/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import SkillGap from "./pages/SkillGap";
import JobAnalyzer from "./pages/JobAnalyzer";
import Roadmap from "./pages/Roadmap";
import Profile from "./pages/Profile";
import CVGenerator from "./pages/CVGenerator";
import JobApplicationTracker from "./pages/JobApplicationTracker";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import InterviewPreparation from "./pages/InterviewPreparation";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Public Website Layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/careers/:id" element={<CareerDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Application Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
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
              <Route
                path="/resume-analyzer"
                element={<ResumeAnalyzer />}
              />
              <Route
                path="/interview-preparation"
                element={<InterviewPreparation />}
              />
            </Route>
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
