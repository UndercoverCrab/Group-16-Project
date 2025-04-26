import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./webpages/Login";
import SignUp from "./webpages/SignUp";
import UserProfileManagement from "./webpages/UserProfileManagement";
import EventManagement from "./webpages/EventManagement";
import NotFound from "./components/404";
import "./components/FooterStyle.css";
import "./components/HeaderStyle.css";
import VolunteerHisoryPage from "./webpages/VolunteerHisoryPage";
import UserProfile from "./webpages/UserProfile";
import Header from "./components/Header";
import { useState, useEffect } from "react";

function App() {
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  if (localStorage.getItem("token") && role === "") {
    return <p>Loading...</p>; // only if logged in but role not ready
  }


  return (
    <Router>
      <Header role={role} />  {/* Pass role to Header */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/user-profile/edit" element={<UserProfileManagement />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route
          path="/event-management"
          element={
            role === "admin" ? <EventManagement /> : <Navigate to="/" replace />
          }
        />
        <Route path="/user-profile/volunteer-history" element={<VolunteerHisoryPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
