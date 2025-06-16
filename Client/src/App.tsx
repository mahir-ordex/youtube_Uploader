import SingIn from "./pages/SingIn";
import Daskboard from "./pages/Daskboard";
import LayOut from "./pages/LayOut";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthSuccess from "./pages/AuthSuccess";
import PrivateRoute from "./utils/privateRoute";
import Login from "./pages/Login";
import { decodeData } from "./utils/encodeDecode";
import { useState, useEffect } from "react";

const App = () => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const encodedUserData = localStorage.getItem("user");
    if (encodedUserData) {
      try {
        const userData = decodeData(encodedUserData);
        setUserRole(userData?.role || null);
      } catch (error) {
        console.error("Failed to decode user data:", error);
      }
    }
  }, []);

  console.log("User role:", userRole);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/signin" element={<SingIn />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/success" element={<AuthSuccess />} />

        {/* Protected routes */}
        {userRole === "user" && (
          <Route path="/" element={<LayOut />}>
            <Route
              index
              element={
                <PrivateRoute>
                  <Daskboard />
                </PrivateRoute>
              }
            />
          </Route>
        )}

        {/* Add a catch-all route if needed */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
