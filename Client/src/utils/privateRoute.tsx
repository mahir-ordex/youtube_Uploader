import { JSX, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { decodeData } from "./encodeDecode";

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const token = localStorage.getItem("auth_token");
  const encodedUserData = localStorage.getItem("user");
  let userData = null;
  
  // Only decode if data exists
  if (encodedUserData) {
    try {
      userData = decodeData(encodedUserData);
    } catch (error) {
      console.error("Failed to decode user data:", error);
      localStorage.removeItem("user"); // Clear invalid data
    }
  }

  console.log("PrivateRoute userData:", userData);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!token || !userData) {
      navigate("/login");
    }
  }, [token, userData, navigate]);

  if (!token || !userData) {
    return null;
  }

  return children;
};

export default PrivateRoute;