import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaBookReader,
  FaTachometerAlt,
  FaUsers,
  FaUserEdit,
} from "react-icons/fa";
import { SiGoogleclassroom } from "react-icons/si";
import { FaExpeditedssl, FaFaceSmile } from "react-icons/fa6";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { HiDocumentReport } from "react-icons/hi";
import "./dashboard.css";
import logo from "../../assets/LoginAssets/logo-impianbunda.png";
import useAuth from "../../context/useAuth";

const AdminSidebar = () => {
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
          to="/admin-dashboard"
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
          to="/admin-dashboard/subjects"
          className={({ isActive }) =>
            `flex items-center space-x-4 py-2.5 px-4 transition-colors
          ${
            isActive
              ? "bg-color5 text-white shadow-right font-semibold border-l-4 border-color1"
              : "hover:bg-gray-200 hover:text-black border-l-4 border-transparent"
          }`
          }
        >
          <FaBookReader />
          <span>Mata Pelajaran</span>
        </NavLink>

        <NavLink
          to="/admin-dashboard/guru-guru"
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
          <span>Guru</span>
        </NavLink>

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
          <span>Kelas dan Siswa</span>
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
        </NavLink>

        <NavLink
          to="/admin-dashboard/students"
          className={({ isActive }) =>
            `flex items-center space-x-4 py-2.5 px-4 transition-colors
        ${
          isActive
            ? "bg-color5 text-white shadow-right font-semibold border-l-4 border-color1"
            : "hover:bg-gray-200 hover:text-black border-l-4 border-transparent"
        }`
          }
        >
          <FaFaceSmile />
          <span>Wajah Siswa</span>
        </NavLink>
        <NavLink
          to="/admin-dashboard/report"
          className={({ isActive }) =>
            `flex items-center space-x-4 py-2.5 px-4 transition-colors
        ${
          isActive
            ? "bg-color5 text-white shadow-right font-semibold border-l-4 border-color1"
            : "hover:bg-gray-200 hover:text-black border-l-4 border-transparent"
        }`
          }
        >
          <HiDocumentReport />
          <span>Cetak Laporan</span>
        </NavLink>
      </div>

      <div className="pb-3">
        <p className="text-xs uppercase mb-2 ml-4">Pengaturan</p>
        <NavLink
          to={`/admin-dashboard/profile/edit/${user?.user?._id}`}
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
          to="/admin-dashboard/setting/ubahPass"
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
        <NavLink
          to="/admin-dashboard/initGallery"
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
          <span>InitGallery</span>
        </NavLink>
      </div>
    </div>
  );
};

export default AdminSidebar;
