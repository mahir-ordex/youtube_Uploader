import { JSX, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute =({children} : PrivateRouteProps) =>{
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("user_id");

     useEffect(() => {
    if (!token || !userId) {
      navigate("/login");
    }
  }, [token, userId, navigate]);
    const navigate = useNavigate();

    if (!token || !userId) {
    return null;
  }

  return children;
}

export default PrivateRoute;