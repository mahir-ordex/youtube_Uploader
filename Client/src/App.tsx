import Login from "./pages/Login";
import Daskboard from "./pages/Daskboard";
import LayOut from "./pages/LayOut";
import { BrowserRouter as Router,Routes,Route } from "react-router-dom";
import AuthSuccess from "./pages/AuthSuccess";
import PrivateRoute from "./utils/privateRoute";

const App = () => {
  return (

      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
 
          <Route path="/" element={<LayOut />} >
            <Route path="/" element={<PrivateRoute><Daskboard /></PrivateRoute>} />
            {/* <Route path="/videos" element={<Video />} /> */}
          </Route>
        </Routes>
      </Router>
  );
};

export default App;
