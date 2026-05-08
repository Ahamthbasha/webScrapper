import { Outlet } from "react-router-dom";
import Header from "../commonLayout/Header"; 
import Footer from "../commonLayout/Footer"; 

const UserLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;