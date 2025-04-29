import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';


const LayOut = () => {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default LayOut;