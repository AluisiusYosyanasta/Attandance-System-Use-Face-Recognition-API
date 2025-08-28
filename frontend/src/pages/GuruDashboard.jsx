import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import UserSidebar from "../components/UserDashboard/UserSidebar";
import NavBar from "../components/UserDashboard/UserNavbar";
import SidebarContext from "../context/SidebarContext";

import "./page.css";

const GuruDashboard = () => {
  useEffect(() => {
    document.title = "Dashboard | Sistem Kehadiran";
  }, []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");

    const justLoggedIn = sessionStorage.getItem("justLoggedIn");
    if (justLoggedIn) {
      sessionStorage.removeItem("justLoggedIn");
      localStorage.setItem("sidebarOpen", "false");
      return false;
    }

    return saved === null ? true : JSON.parse(saved);
  });
  return (
    <SidebarContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 h-screen w-[250px] z-40 bg-white shadow transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <UserSidebar />
        </div>

        {/* Navbar + Main content */}
        <div
          className={`transition-all duration-300 ease-in-out bg-gray-100 min-h-screen
        ${isSidebarOpen ? "ml-[250px]" : "ml-0"} w-full`}
        >
          <NavBar className="sticky top-0 z-40 bg-white shadow" />
          <div className="p-4 w-full max-w-full overflow-x-hidden">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default GuruDashboard;
