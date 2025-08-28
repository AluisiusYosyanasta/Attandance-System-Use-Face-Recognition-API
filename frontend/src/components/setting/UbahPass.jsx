import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { HiChevronRight } from "react-icons/hi";
import { RiLockPasswordFill } from "react-icons/ri";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./UbahPass.css";
import "../../loginRes.css";
import useAuth from "../../context/useAuth";

const UbahPass = () => {
  const { user } = useAuth();
  const dashboardPath =
    user?.user?.role === "admin" ? "/admin-dashboard" : "/guru-dashboard";

  const [setting, setSetting] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const baseURL = import.meta.env.VITE_API_URL;

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [showError, setShowError] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSetting({ ...setting, [name]: value });
  };

  const isPasswordStrong = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{5,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrorMsg("");
    setShowError(false);

    let hasError = false;
    const newErrors = {};

    if (setting.oldPassword === setting.newPassword) {
      newErrors.newPassword =
        "Password baru tidak boleh sama dengan password lama.";
      hasError = true;
    }

    if (!isPasswordStrong(setting.newPassword)) {
      newErrors.newPassword =
        "Password harus minimal 5 karakter, mengandung huruf besar, kecil, angka, dan simbol.";
      hasError = true;
    }

    if (setting.newPassword !== setting.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password tidak cocok.";
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newErrors);
      return;
    }

    try {
      const response = await axios.put(
        `${baseURL}/api/setting/change-password`,
        {
          oldPassword: setting.oldPassword,
          newPassword: setting.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMsg("Password berhasil diubah!");
        setShowSuccess(true);
        setSetting({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      if (error.response?.status === 400) {
        setErrorMsg(error.response.data.error);
      } else {
        setErrorMsg("Terjadi kesalahan");
      }
      setShowError(true);
    }
  };

  useEffect(() => {
    if (errorMsg) {
      const fadeTimer = setTimeout(() => setShowError(false), 2000);
      const clearTimer = setTimeout(() => setErrorMsg(""), 4000);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [errorMsg]);

  useEffect(() => {
    if (successMsg) {
      const fadeTimer = setTimeout(() => setShowSuccess(false), 2000);
      const clearTimer = setTimeout(() => setSuccessMsg(""), 4000);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [successMsg]);

  const errorStyle = {
    color: "red",
    fontSize: "12px",
    opacity: showError ? 1 : 0,
    transition: "opacity 1s ease-in-out",
  };

  const successStyle = {
    backgroundColor: "#D1FAE5",
    color: "#065F46",
    padding: "10px",
    borderRadius: "5px",
    fontSize: "14px",
    opacity: showSuccess ? 1 : 0,
    transition: "opacity 1s ease-in-out",
    marginBottom: "1rem",
  };

  useEffect(() => {
    document.title = "Ubah Password | Sistem Kehadiran";
  }, []);
  return (
    <div className="mt-10 p-5">
      <h1 className="max-w-xl w-96 mx-auto text-xl font-semibold text-gray-800 mb-2">
        Ubah Password
      </h1>
      <div className="max-w-xl w-96 mx-auto flex items-center text-sm text-gray-500 space-x-1">
        <Link to={dashboardPath}>
          <span className="hover:underline hover:text-color5 cursor-pointer">
            Dashboard
          </span>
        </Link>
        <HiChevronRight className="text-gray-400" />
        <Link to={`${dashboardPath}/setting/ubahPass`}>
          <span className="hover:underline text-color5 cursor-pointer">
            Ubah Password
          </span>
        </Link>
      </div>
      <div className="max-w-96 w-full mx-auto mt-5 bg-white p-8 rounded-md shadow-md gap-5">
        <form onSubmit={handleSubmit}>
          {/* Old Password */}
          <div className="inputDiv mb-5">
            <div
              className={`input flex items-center relative ${
                fieldErrors.oldPassword ? "border border-red-500 rounded" : ""
              }`}
            >
              <RiLockPasswordFill className="icon" />
              <input
                type={showOld ? "text" : "password"}
                name="oldPassword"
                placeholder="Password Awal"
                onChange={handleChange}
                value={setting.oldPassword}
                required
              />
              <div
                className="absolute right-3 cursor-pointer text-gray-400"
                onClick={() => setShowOld(!showOld)}
              >
                {showOld ? <FiEyeOff /> : <FiEye />}
              </div>
            </div>
            {fieldErrors.oldPassword && (
              <p className="text-xs text-red-500 mt-1">
                {fieldErrors.oldPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="inputDiv mb-5">
            <div
              className={`input flex items-center relative ${
                fieldErrors.newPassword ? "border border-red-500 rounded" : ""
              }`}
            >
              <RiLockPasswordFill className="icon" />
              <input
                type={showNew ? "text" : "password"}
                name="newPassword"
                placeholder="Password Baru"
                onChange={handleChange}
                value={setting.newPassword}
                required
              />
              <div
                className="absolute right-3 cursor-pointer text-gray-400"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <FiEyeOff /> : <FiEye />}
              </div>
            </div>
            {fieldErrors.newPassword && (
              <p className="text-xs text-red-500 mt-1">
                {fieldErrors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="inputDiv mb-5">
            <div
              className={`input flex items-center relative ${
                fieldErrors.confirmPassword
                  ? "border border-red-500 rounded"
                  : ""
              }`}
            >
              <RiLockPasswordFill className="icon" />
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Konfirmasi Password"
                onChange={handleChange}
                value={setting.confirmPassword}
                required
              />
              <div
                className="absolute right-3 cursor-pointer text-gray-400"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </div>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1 ">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Error & Success Messages */}
          {errorMsg && <p style={errorStyle}>{errorMsg}</p>}
          {successMsg && <div style={successStyle}>{successMsg}</div>}

          <button
            type="submit"
            className="w-full mt-5 bg-color5 hover:bg-color4 text-white hover:font-semibold py-2 px-4 rounded-md"
          >
            Ubah Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default UbahPass;
