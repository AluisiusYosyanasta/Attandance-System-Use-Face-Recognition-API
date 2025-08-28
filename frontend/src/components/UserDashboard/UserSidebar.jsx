import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaBookReader,
  FaTachometerAlt,
  FaUsers,
  FaUserEdit,
} from "react-icons/fa";
import { SiGoogleclassroom } from "react-icons/si";
import { FaExpeditedssl } from "react-icons/fa6";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { ImProfile } from "react-icons/im";
import "../dashboard/dashboard.css";
import logo from "../../assets/LoginAssets/logo-impianbunda.png";
import useAuth from "../../context/useAuth";

const UserSidebar = () => {
  const { user } = useAuth();
  return (
    <div className="bg-gray-200 text-black h-screen fixed left-0 bottom-0 top-0 space-y-2 w-[250px] shadow-right">
      <div className="justify-center items-center flex">
        <img className="mt-6 w-36 h-36" src={logo} alt="Logo" />
      </div>
      <h3 className="font-Montserrat text-[20px] pb-5 justify-center font-semibold items-center flex">
        Sistem Kehadiran
      </h3>
      <div className="pb-3">
        <p className="text-xs uppercase mb-2 ml-4">Navigation</p>
        <NavLink
          to="/guru-dashboard"
          className={({ isActive }) =>
            `flex items-center space-x-4 py-2.5 px-4 transition-colors
          ${
            isActive
              ? "bg-color5 text-white shadow-right font-semibold border-l-4 border-color1"
              : "hover:bg-gray-200 hover:text-black border-l-4 border-transparent"
          }`
          }
          end
        >
          <FaTachometerAlt />
          <span>Dashboard</span>
        </NavLink>
      </div>

      <div className="pb-3">
        <p className="text-xs uppercase mb-2 ml-4">Data Sekolah</p>
        <NavLink
          to={`/guru-dashboard/profile/${user.user._id}`}
          className={({ isActive }) =>
            `flex items-center space-x-4 py-2.5 px-4 transition-colors
          ${
            isActive
              ? "bg-color5 text-white shadow-right font-semibold border-l-4 border-color1"
              : "hover:bg-gray-200 hover:text-black border-l-4 border-transparent"
          }`
          }
        >
          <ImProfile />
          <span>Profile Guru</span>
        </NavLink>

        <NavLink
          to="/guru-dashboard/guru-schedule"
          end
          className={({ isActive }) =>
            `flex items-center space-x-4 py-2.5 px-4 transition-colors
        ${
          isActive
            ? "bg-color5 text-white shadow-right font-semibold border-l-4 border-color1"
            : "hover:bg-gray-200 hover:text-black border-l-4 border-transparent"
        }`
          }
        >
          <RiCalendarScheduleFill />
          <span>Presensi</span>
        </NavLink>

        {/* <NavLink
          to="/guru-dashboard/presensi"
          end
          className={({ isActive }) =>
            `flex items-center space-x-4 py-2.5 px-4 transition-colors
        ${
          isActive
            ? "bg-color5 text-white shadow-right font-semibold border-l-4 border-color1"
            : "hover:bg-gray-200 hover:text-black border-l-4 border-transparent"
        }`
          }
        >
          <FaUsers />
          <span>Presensi</span>
        </NavLink> */}

        {/* 

        <NavLink
          to="/admin-dashboard/rooms"
          className={({ isActive }) =>
            `flex items-center space-x-4 py-2.5 px-4 transition-colors
        ${
          isActive
            ? "bg-color5 text-white shadow-right font-semibold border-l-4 border-color1"
            : "hover:bg-gray-200 hover:text-black border-l-4 border-transparent"
        }`
          }
        >
          <SiGoogleclassroom />
          <span>Kelas</span>
        </NavLink>

        <NavLink
          to="/admin-dashboard/schedules"
          className={({ isActive }) =>
            `flex items-center space-x-4 py-2.5 px-4 transition-colors
        ${
          isActive
            ? "bg-color5 text-white shadow-right font-semibold border-l-4 border-color1"
            : "hover:bg-gray-200 hover:text-black border-l-4 border-transparent"
        }`
          }
        >
          <RiCalendarScheduleFill />
          <span>Jadwal</span>
        </NavLink> */}
      </div>

      <div className="pb-3">
        <p className="text-xs uppercase mb-2 ml-4">Pengaturan</p>
        <NavLink
          to={`/guru-dashboard/profile/edit/${user.user._id}`}
          className={({ isActive }) =>
            `flex items-center space-x-4 py-2.5 px-4 transition-colors
        ${
          isActive
            ? "bg-color5 text-white shadow-right font-semibold border-l-4 border-color1"
            : "hover:bg-gray-200 hover:text-black border-l-4 border-transparent"
        }`
          }
        >
          <FaUserEdit />
          <span>Ubah Profile</span>
        </NavLink>

        <NavLink
          to="/guru-dashboard/setting/ubahPass"
          className={({ isActive }) =>
            `flex items-center space-x-4 py-2.5 px-4 transition-colors
        ${
          isActive
            ? "bg-color5 text-white shadow-right font-semibold border-l-4 border-color1"
            : "hover:bg-gray-200 hover:text-black border-l-4 border-transparent"
        }`
          }
        >
          <FaExpeditedssl />
          <span>Ubah Password</span>
        </NavLink>
      </div>
    </div>
  );
};

export default UserSidebar;
