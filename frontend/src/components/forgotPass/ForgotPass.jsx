import React, { useState, useEffect } from "react";
import "./ForgotPass.css";
import "../../loginRes.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// Import Assets
import logo from "../../assets/LoginAssets/forgot.jpeg";

// Import Icons
import { MdLogin } from "react-icons/md";
import { IoChevronBackSharp } from "react-icons/io5";
import { MdAttachEmail } from "react-icons/md";

const ForgotPass = () => {
  const [forgotemail, setForgotEmail] = useState("");
  const navigateTo = useNavigate();

  const [forgotStatus, setForgotStatus] = useState("");
  const [statusHolder, setStatusHolder] = useState("message");
  const baseURL = import.meta.env.VITE_API_URL;

  const createForgotPass = (e) => {
    e.preventDefault();
    if (forgotemail === "") {
      setForgotStatus("Silakan isi kolom Email!");
      return;
    }

    axios
      .post(`${baseURL}/api/auth/forgotPass`, {
        ForgotEmail: forgotemail,
      })
      .then(() => {
        localStorage.setItem("forgotEmail", forgotemail);
        navigateTo("/resetPass");
      })
      .catch((error) => {
        if (error.response) {
          setForgotStatus(error.response.data.message);
        } else {
          setForgotStatus("There was an error processing your request.");
        }
      });
  };

  useEffect(() => {
    document.title = "Verifikasi Email | Sistem Kehadiran";
    if (forgotStatus !== "") {
      setStatusHolder("showMessage");
      setTimeout(() => {
        setStatusHolder("message");
        setForgotStatus("");
      }, 2000);
    }
  }, [forgotStatus]);

  return (
    <div className="forgotpassPage flex">
      <div className="container flex">
        <div className="buttonBack">
          <IoChevronBackSharp className="icon" />
          <span>
            <Link to={"/"}>Kembali</Link>
          </span>
        </div>

        <div className="formDiv flex">
          <div className="headerDiv">
            <img src={logo} alt="Logo Image" />
            <h3>Apakah Anda Lupa Password?</h3>
            <p>Masukkan Email Anda Untuk Mengubah Password Anda</p>
          </div>

          <form className="form grid" onSubmit={createForgotPass}>
            <span className={statusHolder}>{forgotStatus}</span>

            <div className="inputDiv">
              <div className="input flex">
                <MdAttachEmail className="icon" />
                <input
                  type="email"
                  id="email"
                  placeholder="Masukkan Email"
                  onChange={(event) => setForgotEmail(event.target.value)}
                />
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

export default ForgotPass;
