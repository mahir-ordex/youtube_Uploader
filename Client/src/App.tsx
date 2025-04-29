import Login from "./pages/Login";
import Daskboard from "./pages/Daskboard";
import LayOut from "./pages/LayOut";
import { BrowserRouter as Router,Routes,Route } from "react-router-dom";

const App = () => {
  return (

      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<LayOut />} >
            <Route path="/" element={<Daskboard />} />
            {/* <Route path="/videos" element={<Video />} /> */}
          </Route>
        </Routes>
      </Router>
  );
};

export default App;
