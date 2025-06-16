import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { encodeData } from "../utils/encodeDecode";


const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const userId = searchParams.get("id"); 
  const role = searchParams.get("role") || "user"; // Default to 'user' if not specified
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    if (token && userId) {
      try {
        const userData = encodeData({ userId, role });
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", userData);
        
        setTimeout(() => {
          navigate("/");
        }, 100);
      } catch (error) {
        console.error("Error encoding user data:", error);
        setError("Authentication failed: Could not process user data");
      }
    } else {
      setError("Authentication failed: Missing required credentials");
      console.error("Authentication failed. Missing token or userId.");
    }
  }, [token, userId, role, navigate]); // Include all dependencies

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-red-200 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Authentication Failed</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-green-200 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-green-800 mb-4">Authentication Successful!</h1>
        <p className="text-gray-600 mb-4">You've been successfully authenticated.</p>
        <p className="text-gray-500">Redirecting...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
