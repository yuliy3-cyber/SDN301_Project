import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import AdminDashboard from "./admin/AdminDashboard";
import UserDashboard from "./user/UserDashboard";
import RequireAuth from "./components/RequireAuth";
import LandingPage from "./pages/LandingPage";
import CreateQuestion from "./admin/CreateQuestion";
import TakeExam from "./user/TakeExam";
import EnterExamCode from "./user/EnterExamCode";
import UserResults from "./user/UserResults";
import UserProfile from "./user/UserProfile";
import PracticeQuiz from "./user/PracticeQuiz";
import AdminResults from "./admin/adminResult";
import AdminUsers from "./admin/AdminUsers";
import AdminTests from "./admin/AdminTests";
import MainLayout from "./layout/mainlayout/MainLayout";
import "antd/dist/reset.css";
import Register from "./pages/register";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <Routes>
  
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

  
      <Route element={<RequireAuth allowedRoles={["user"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/user/quiz" element={<EnterExamCode />} />
          <Route path="/user/quiz/:examId" element={<TakeExam />} />
          <Route path="/user/results" element={<UserResults />} />
          <Route path="/user/profile" element={<UserProfile />} />
          <Route path="/user/questions" element={<PracticeQuiz />} />
          
       
        </Route>
      </Route>

   
      <Route element={<MainLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/tests" element={<AdminTests />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/questions" element={<CreateQuestion />} />
        <Route path="/admin/results" element={<AdminResults />} />
      </Route>
    </Routes>
  );
}

export default App;
