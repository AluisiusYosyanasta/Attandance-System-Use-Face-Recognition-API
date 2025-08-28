import React from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { HiChevronRight } from "react-icons/hi";

const AddSubject = () => {
  const [subject, setSubject] = useState({
    sub_code: "",
    sub_name: "",
    description: "",
  });
  const baseURL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "sub_name") {
      const upperValue = value.toUpperCase();
      const prefix = value.trim().toUpperCase().substring(0, 3);
      const randomNumber = Math.floor(100 + Math.random() * 900);
      const code = prefix ? `${prefix}${randomNumber}` : "";

      setSubject({
        ...subject,
        sub_name: upperValue,
        sub_code: code,
      });
    } else {
      setSubject({
        ...subject,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${baseURL}/api/subject/add`, subject, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data.success) {
        navigate("/admin-dashboard/subjects");
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
        handleSubmit(e);
      }
    }
  };

  return (
    <div className="mt-10 p-5">
      <h1 className="max-w-4xl mx-auto text-xl font-semibold text-gray-800 mb-2">
        Mata Pelajaran
      </h1>
      <div className="max-w-4xl mx-auto flex items-center text-sm text-gray-500 space-x-1">
        <Link to="/admin-dashboard">
          <span className="hover:underline hover:text-color5 cursor-pointer">
            Dashboard
          </span>
        </Link>
        <HiChevronRight className="text-gray-400" />
        <Link to="/admin-dashboard/subjects">
          <span className="hover:underline hover:text-color5 cursor-pointer">
            List
          </span>
        </Link>
        <HiChevronRight className="text-gray-400" />
        <Link to="/admin-dashboard/add-subject">
          <span className="hover:underline text-color5 cursor-pointer">
            Mata Pelajaran
          </span>
        </Link>
      </div>
      <div className="max-w-4xl mx-auto mt-5 bg-white p-8 rounded-md shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sub_name" className="font-semibold text-gray-700">
                Nama Mata Pelajaran
              </label>
              <input
                type="text"
                name="sub_name"
                value={subject.sub_name}
                onChange={handleChange}
                placeholder="Nama Mata Pelajaran"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="sub_code" className="font-semibold text-gray-700">
                Kode Mata Pelajaran
              </label>
              <input
                type="text"
                name="sub_code"
                value={subject.sub_code}
                onChange={handleChange}
                placeholder="Kode Mata Pelajaran"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
          <div className="mt-5">
            <label
              htmlFor="description"
              className="font-semibold text-gray-700"
            >
              Deskripsi
            </label>
            <textarea
              name="description"
              placeholder="Penjelasan Mata Pelajaran"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              rows="4"
            />
          </div>
          <button
            type="submit"
            className="w-full mt-6 bg-color5 hover:bg-color4 text-white font-bold py-2 px-4 rounded"
          >
            Tambahkan Mata Pelajaran
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSubject;
