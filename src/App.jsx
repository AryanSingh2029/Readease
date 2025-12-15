import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Pages
const Home = lazy(() => import("./ReadeaseLandingWithTheme.jsx"));
const SimplifyDoc = lazy(() => import("./SimplifyDoc.jsx"));
const Login = lazy(() => import("./Login.jsx"));
const Signup = lazy(() => import("./Signup.jsx"));

// Dashboards (NEW)
const StudentDashboard = lazy(() => import("./StudentDashboard.jsx"));
const SchoolDashboardGradeFlow = lazy(() => import("./SchoolDashboardGradeFlow.jsx"));

// Optional pages
const UpcomingQuiz = lazy(() => import("./UpcomingQuizzes.jsx"));
const Chatting = lazy(() => import("./ChatDoubts.jsx"));
const Notess = lazy(() => import("./Notes.jsx"));
const StudentProfile = lazy(() => import("./StudentProfile.jsx"));
const SchoolProfile = lazy(() => import("./SchoolProfile.jsx"));
const Ree = lazy(() => import("./Reply.jsx"));
const NotFound = () => <div style={{ padding: 24 }}>404</div>;

export default function App() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/simplify" element={<SimplifyDoc />} />

        {/* Role-specific dashboards */}
        <Route path="/Studentdashboard" element={<StudentDashboard />} />
        <Route path="/SchooldashboardGradeFlow" element={<SchoolDashboardGradeFlow />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Extras */}
        <Route path="/quizzes" element={<UpcomingQuiz />} />
        <Route path="/chat" element={<Chatting />} />
        <Route path="/notes" element={<Notess />} />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/schoolprofile" element={<SchoolProfile />} />
        <Route path="/reply" element={<Ree />} />
        {/* Convenience redirect */}
        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
