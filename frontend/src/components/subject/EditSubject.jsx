import React from "react";
import { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { HiChevronRight } from "react-icons/hi";

const EditSubject = () => {
  const { id } = useParams();
  const [subject, setSubject] = useState({
    sub_name: "",
    sub_code: "",
    description: "",
  });
  const [subLoading, setSubLoading] = useState(false);
  const [subCodeWarning, setSubCodeWarning] = useState("");
  const navigate = useNavigate();

  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchSubjects = async () => {
      setSubLoading(true);
      try {
        const response = await axios.get(`${baseURL}/api/subject/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.data.success) {
          setSubject(response.data.subject);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      } finally {
        setSubLoading(false);
      }
    };
    fetchSubjects();
  }, [id, baseURL]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "sub_code") {
      let formatted = value.toUpperCase();
      const letters = formatted.replace(/[^A-Z]/g, "").slice(0, 3);
      const numbers = formatted.replace(/[^0-9]/g, "").slice(0, 3);

      formatted = letters + numbers;

      if (letters.length < 3 && /[^A-Z]/.test(value[value.length - 1])) {
        setSubCodeWarning("Masukkan 3 huruf terlebih dahulu.");
      } else if (
        letters.length === 3 &&
        /[^0-9]/.test(value[value.length - 1])
      ) {
        setSubCodeWarning("Setelah 3 huruf, hanya boleh 3 angka.");
      } else if (letters.length === 3 && numbers.length > 3) {
        setSubCodeWarning("Maksimal 3 angka setelah 3 huruf.");
      } else {
        setSubCodeWarning("");
      }

      setSubject((prev) => ({
        ...prev,
        sub_code: formatted,
      }));
    } else if (name === "sub_name") {
      setSubject((prev) => ({
        ...prev,
        sub_name: value.toUpperCase(),
      }));
    } else {
      setSubject((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${baseURL}/api/subject/${id}`,
        subject,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        navigate("/admin-dashboard/subjects");
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    }
  };

  return (
    <>
      {subLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-teal-600"></div>
          <span className="ml-3 text-teal-600 font-semibold">Loading...</span>
        </div>
      ) : (
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
                  <label
                    htmlFor="sub_name"
                    className="font-semibold text-gray-700"
                  >
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
                  <label
                    htmlFor="sub_code"
                    className="font-semibold text-gray-700"
                  >
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
                  {subCodeWarning && (
                    <p className="text-sm text-red-500 mt-1">
                      {subCodeWarning}
                    </p>
                  )}
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
                  value={subject.description}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  rows="4"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-6 bg-color5 hover:bg-color4 text-white font-bold py-2 px-4 rounded"
              >
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EditSubject;
