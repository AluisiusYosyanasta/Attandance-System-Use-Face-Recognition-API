import React, { useEffect, useState } from "react";
import "./Register.css";
import "../../loginRes.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import video from "../../assets/LoginAssets/video2.mp4";

import { FaUserShield } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { MdAttachEmail } from "react-icons/md";
import { MdLogin } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const navigateTo = useNavigate();

  const [registerStatus, setRegisterStatus] = useState("");
  const [statusHolder, setStatusHolder] = useState("message");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const baseURL = import.meta.env.VITE_API_URL;

  const isPasswordValid = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{5,}$/;
    return regex.test(password);
  };

  const createUser = (e) => {
    e.preventDefault();
    if (email === "" || userName === "" || password === "" || role === "") {
      setRegisterStatus("Silakan isi kolom yang kosong!");
      return;
    }

    if (!isPasswordValid(password)) {
      setRegisterStatus(
        "Password harus minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol."
      );
      return;
    }

    axios
      .post(`${baseURL}/api/auth/register`, {
        Email: email,
        UserName: userName,
        Password: password,
        Role: role,
      })
      .then(() => {
        navigateTo("/");
      })
      .catch((error) => {
        if (error.response) {
          setRegisterStatus(error.response.data.message);
        } else {
          setRegisterStatus("There was an error processing your request.");
        }
      });
  };

  useEffect(() => {
    document.title = "Register | Sistem Kehadiran";
    if (registerStatus !== "") {
      setStatusHolder("showMessage");
      setTimeout(() => {
        setStatusHolder("message");
        setRegisterStatus("");
      }, 2000);
    }
  }, [registerStatus]);
  const onSubmit = (e) => {
    e.preventDefault();
    createUser(e);
  };

  const togglePassword = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="registerPage flex">
      <div className="container flex">
        <div className="videoDiv">
          <video src={video} autoPlay muted loop></video>

          <div className="textDiv">
            <h2 className="title">Attendance System</h2>
            <p>Today is one step closer to your dream!</p>
          </div>

          <div className="footerDiv flex">
            <span className="text">Apakah Sudah Punya Akun?</span>
            <Link to={"/"}>
              <button className="btn">Login</button>
            </Link>
          </div>
        </div>

        <div className="formDiv flex">
          <div className="headerDiv">
            <h3>Silahkan Buat Akun</h3>
          </div>

          <form action="" className="form grid" onSubmit={onSubmit}>
            <span className={statusHolder}>{registerStatus}</span>

            <div className="inputDiv">
              <label htmlFor="email">Email</label>
              <div className="input flex">
                <MdAttachEmail className="icon" />
                <input
                  type="email"
                  id="email"
                  placeholder="Masukkan Email"
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="inputDiv">
              <label htmlFor="username">Username</label>
              <div className="input flex">
                <FaUserShield className="icon" />
                <input
                  type="text"
                  id="username"
                  placeholder="Masukkan Username"
                  onChange={(event) => setUserName(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="inputDiv">
              <label htmlFor="password">Password</label>
              <div className="input flex">
                <RiLockPasswordFill className="icon" />
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  placeholder="Masukkan Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <span className="icon" onClick={togglePassword}>
                  {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {password && !isPasswordValid(password) && (
                <p className="text-red-500 text-sm font-medium leading-relaxed mt-2 max-w-xs">
                  Password harus minimal 5 karakter, mengandung huruf besar,
                  huruf kecil, angka, dan simbol.
                </p>
              )}
            </div>

            <div className="inputDiv">
              <label htmlFor="role">Role</label>
              <div className="select flex">
                <select
                  id="role"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  required
                >
                  <option value="">Pilih Role</option>
                  <option value="guru">Guru</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn flex">
              <span>Register</span>
              <MdLogin className="icon" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
