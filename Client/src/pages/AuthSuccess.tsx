import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const userId = searchParams.get("id"); // ✅ fix here
  const navigate = useNavigate();

  useEffect(() => {
    if (token && userId) {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_id", userId);

      setTimeout(() => {
        navigate("/");
      }, 100);
    } else {
      console.error("Authentication failed. Missing token or userId.");
    }
  }, [token, userId]);

  return (
    <div>
      <h1>Authentication Successful</h1>
      <p>Redirecting...</p>
    </div>
  );
};

export default AuthSuccess;
