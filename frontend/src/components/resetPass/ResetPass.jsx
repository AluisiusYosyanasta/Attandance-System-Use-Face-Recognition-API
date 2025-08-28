import React, { useState, useEffect } from "react";
import "./ResetPass.css";
import "../../loginRes.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import logo from "../../assets/LoginAssets/forgot.jpeg";

// Icons
import { MdLogin } from "react-icons/md";
import { IoChevronBackSharp } from "react-icons/io5";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPass = () => {
  const [newpass, setNewPassword] = useState("");
  const [confirmPass, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const navigateTo = useNavigate();

  const [resetStatus, setResetStatus] = useState("");
  const [statusHolder, setStatusHolder] = useState("message");

  const forgotEmail = localStorage.getItem("forgotEmail");
  const baseURL = import.meta.env.VITE_API_URL;

  const isPasswordValid = (newpass) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{5,}$/;
    return regex.test(newpass);
  };

  useEffect(() => {
    if (!forgotEmail) {
      navigateTo("/forgotPass");
    }
  }, [forgotEmail, navigateTo]);

  const createResetPass = (e) => {
    e.preventDefault();

    if (!newpass || !confirmPass) {
      setResetStatus("Harap isi kedua kolom Password!");
      return;
    }

    if (newpass !== confirmPass) {
      setResetStatus("Passwords Tidak Cocok!");
      return;
    }

    if (!isPasswordValid(newpass)) {
      setResetStatus(
        "Password harus minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol."
      );
      return;
    }

    axios
      .post(`${baseURL}/api/auth/resetPass`, {
        NewPassword: newpass,
        email: forgotEmail,
      })
      .then(() => {
        localStorage.removeItem("forgotEmail");
        navigateTo("/");
      })
      .catch((error) => {
        if (error.response) {
          setResetStatus(error.response.data.message);
        } else {
          setResetStatus("There was an error processing your request.");
        }
      });
  };

  useEffect(() => {
    document.title = "Reset Password | Sistem Kehadiran";
    if (resetStatus !== "") {
      setStatusHolder("showMessage");
      setTimeout(() => {
        setStatusHolder("message");
        setResetStatus("");
      }, 2000);
    }
  }, [resetStatus]);

  return (
    <div className="resetpassPage flex">
      <div className="container flex">
        <div className="buttonBack">
          <IoChevronBackSharp className="icon" />
          <span>
            <Link to={"/forgotPass"}>Kembali</Link>
          </span>
        </div>

        <div className="formDiv flex">
          <div className="headerDiv">
            <img src={logo} alt="Logo" />
            <h3>Reset Password Anda!</h3>
            <p>Masukkan dan konfirmasikan kata sandi baru Anda!</p>
          </div>

          <form className="form grid" onSubmit={createResetPass}>
            <span className={statusHolder}>{resetStatus}</span>

            <div className="inputDiv">
              <label htmlFor="newpass">Password Baru</label>
              <div className="input flex">
                <RiLockPasswordFill className="icon" />
                <input
                  type={showNewPass ? "text" : "password"}
                  id="newpass"
                  placeholder="Masukkan Password Baru"
                  value={newpass}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <span
                  className="icon"
                  onClick={() => setShowNewPass(!showNewPass)}
                >
                  {showNewPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {newpass && !isPasswordValid(newpass) && (
                <p className="errorText">
                  Password harus minimal 5 karakter, mengandung huruf besar,
                  huruf kecil, angka, dan simbol.
                </p>
              )}
            </div>

            <div className="inputDiv">
              <label htmlFor="confirmpass">Konfirmasi Password</label>
              <div className="input flex">
                <RiLockPasswordFill className="icon" />
                <input
                  type={showConfirmPass ? "text" : "password"}
                  id="confirmpass"
                  placeholder="Konfirmasi Password Baru"
                  value={confirmPass}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <span
                  className="icon"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                >
                  {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <button type="submit" className="btn flex">
              <span>Reset Password</span>
              <MdLogin className="icon" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPass;
