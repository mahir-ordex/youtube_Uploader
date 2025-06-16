import { useState } from "react";

const SingIn = () => {
  const [role, setRole] = useState<"creator" | "user">("user");
  const isCreator = role === "creator";

  const handleLogin = () => {

    const state = encodeURIComponent(JSON.stringify({ process: "signin", role }));
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google?state=${state}`;
  };



  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${isCreator ? "from-red-50 to-red-100" : "from-blue-50 to-blue-100"
        }`}
    >
      <div
        className={`bg-white p-8 rounded-lg shadow-lg border ${isCreator ? "border-red-200" : "border-blue-200"
          } max-w-md w-full mx-4`}
      >
        {/* Role Selector Info */}
        {/* <div className="bg-yellow-100 text-sm text-gray-800 p-2 rounded mb-4 text-center">
          <strong>Note:</strong> Please select your role before logging in.
        </div> */}

        {/* Role Toggle */}
        <div
          className={`flex justify-center mb-6 ${isCreator ? "text-red-600" : "text-blue-600"
            }`}
        >
          <div
            className={`flex border rounded-full overflow-hidden shadow-sm relative -top-12  ${isCreator ? "border-red-400" : "border-blue-400"
              }`}
          >
            <button
              className={`px-4 py-2 w-30 rounded-full text-sm font-semibold transition ${isCreator ? "bg-red-600 text-white" : "bg-white text-black"
                }`}
              onClick={() => setRole("creator")}
            >
              Creator
            </button>
            <button
              className={`px-4 py-2 w-30 rounded-full text-sm font-semibold transition ${!isCreator ? "bg-blue-600 text-white" : "bg-white text-black"
                }`}
              onClick={() => setRole("user")}
            >
              User
            </button>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h1
            className={`text-2xl font-bold mb-2 ${isCreator ? "text-red-900" : "text-blue-900"
              }`}
          >
            Welcome Back
          </h1>
          <p className={`${isCreator ? "text-red-600" : "text-blue-600"}`}>
            Sign in to continue to your account
          </p>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleLogin}
          className={`w-full ${isCreator
              ? "bg-red-600 hover:bg-red-700 focus:ring-red-300"
              : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300"
            } text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 flex items-center justify-center gap-3`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Login with Google
        </button>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p
            className={`text-sm ${isCreator ? "text-red-500" : "text-blue-500"
              }`}
          >
            Secure login powered by Google OAuth
          </p>
        </div>
      </div>
    </div>
  );
};

export default SingIn;
