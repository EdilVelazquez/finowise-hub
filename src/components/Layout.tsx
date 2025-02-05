import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./layout/Sidebar";
import MobileNavigation from "./layout/MobileNavigation";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNavigation />

      {/* Main content */}
      <div className="md:pl-64">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;