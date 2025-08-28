import React, { useContext, useEffect, useRef, useState } from "react";
import useAuth from "../../context/useAuth";
import { FaSignOutAlt, FaBars, FaRegUser } from "react-icons/fa";
import SidebarContext from "../../context/SidebarContext";

import "./dashboard.css";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const { user, logout } = useAuth();
  const { isSidebarOpen, setIsSidebarOpen } = useContext(SidebarContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowDropdown]);

  return (
    <div className="w-full flex shadow-bottom items-center top-0 sticky justify-between h-16 p-2 sm:px-0 lg:p-2 text-white">
      <button
        onClick={() => {
          localStorage.setItem("sidebarOpen", JSON.stringify(!isSidebarOpen));
          setIsSidebarOpen((prev) => !prev);
        }}
        className="group p-2 bg-gray-100 active:bg-color5 rounded transition-all duration-900"
      >
        <FaBars
          size={20}
          className="text-black opacity-50 transition-colors duration-200 group-active:text-white group-active:opacity-100"
        />
      </button>

      <div
        className="relative flex items-center gap-4 px-2 mt-2"
        ref={dropdownRef}
      >
        {!showDropdown && (
          <div
            className={`text-black transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap 
        ${showDropdown ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
          >
            <div className="max-w-[250px] lg:max-w-full inline-block animate-marquee">
              Selamat Datang, <strong>{user?.user?.name}</strong>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowDropdown((prev) => !prev)}
          className="group pb-2"
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden transition-all duration-200 ${
              showDropdown ? "bg-color5 scale-110" : "bg-gray-200"
            }`}
          >
            {user?.user?.profileImage ? (
              <img
                src={`${import.meta.env.VITE_API_URL}/${
                  user?.user?.profileImage
                }`}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span
                className={`text-sm font-semibold ${
                  showDropdown ? "text-white" : "text-black"
                }`}
              >
                {user?.user?.name?.charAt(0).toUpperCase() || "?"}
              </span>
            )}
          </div>
        </button>

        {showDropdown && (
          <div className="absolute right-6 mt-[230px] w-72 bg-white shadow-lg rounded-md overflow-hidden z-50">
            <div className="bg-color5 text-white p-2 flex flex-col items-center">
              <h4 className="font-semibold">{user?.user?.name} 👋</h4>
              <p className="text-sm">{user?.user?.email}</p>
            </div>
            <div className="p-4 space-y-3 text-gray-600">
              <div className="flex items-center gap-2 cursor-pointer hover:text-sky-600">
                <span
                  onClick={() =>
                    navigate(`/admin-dashboard/profile/${user?.user?._id}`)
                  }
                >
                  Profile
                </span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer hover:text-sky-600">
                <span
                  onClick={() => navigate(`/admin-dashboard/setting/ubahPass`)}
                >
                  Ubah Password
                </span>
              </div>
            </div>
            <div className="px-4 pb-4">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 bg-color5 hover:bg-color4 text-white py-2 rounded transition"
              >
                <FaSignOutAlt className="text-lg" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavBar;
