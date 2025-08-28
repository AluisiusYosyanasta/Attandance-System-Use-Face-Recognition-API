import React, { useEffect, useState } from "react";
import "./Login.css";
import "../../loginRes.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import video from "../../assets/LoginAssets/video2.mp4";
import logo from "../../assets/LoginAssets/logo-impianbunda.png";
import { FaUserShield } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { MdLogin } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useAuth from "./../../context/useAuth";

const Login = () => {
  const { login, refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loginStatus, setLoginStatus] = useState("");
  const [statusHolder, setStatusHolder] = useState("message");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginStatus("Silakan isi Email dan Kata Sandi!");
      return;
    }

    try {
      const baseURL = import.meta.env.VITE_API_URL;

      const response = await axios.post(`${baseURL}/api/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        login(response.data.user);
        localStorage.setItem("token", response.data.token);

        await refreshUser();

        sessionStorage.setItem("justLoggedIn", "true");

        if (response.data.user.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/guru-dashboard");
        }
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        setLoginStatus(error.response.data.error);
      } else {
        setLoginStatus("Login gagal, coba lagi nanti.");
      }
      setPassword("");
    }
  };

  useEffect(() => {
    document.title = "Login | Sistem Kehadiran";
    if (loginStatus !== "") {
      setStatusHolder("showMessage");
      const timer = setTimeout(() => setStatusHolder("message"), 2000);
      return () => clearTimeout(timer);
    }
  }, [loginStatus]);

  const togglePassword = () => setPasswordVisible(!passwordVisible);

  return (
    <div className="loginPage flex">
      <div className="container flex">
        <div className="videoDiv">
          <video src={video} autoPlay muted loop />
          <div className="textDiv">
            <h2 className="title">Attendance System</h2>
            <p>Today is one step closer to your dream!</p>
          </div>
          <div className="footerDiv flex">
            <span className="text">Belum punya akun?</span>
            <Link to="/register">
              <button className="btn">Daftar Akun</button>
            </Link>
          </div>
        </div>

        <div className="formDiv flex">
          <div className="headerDiv">
            <img src={logo} alt="Logo" />
          </div>

          <form className="form grid" onSubmit={handleSubmit}>
            <span className={statusHolder}>{loginStatus}</span>
            <div className="inputDiv">
              <label htmlFor="email">Email</label>
              <div className="input flex">
                <FaUserShield className="icon" />
                <input
                  type="email"
                  id="email"
                  placeholder="Masukkan Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span className="icon" onClick={togglePassword}>
                  {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <button type="submit" className="btn flex">
              <span>Login</span>
              <MdLogin className="icon" />
            </button>

            <span className="forgotPassword">
              Lupa Password? <Link to="/forgotPass">Klik Disini</Link>
            </span>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
