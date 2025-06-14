// import { useNavigate } from 'react-router-dom';

const Login = () => {
  // const navigate = useNavigate();

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;

  };

  return (
    <div>
      <button onClick={handleLogin}>
        Login with Google
      </button>
    </div>
  );
};

export default Login;
