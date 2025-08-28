import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { HiChevronRight } from "react-icons/hi";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const EditRoom = () => {
  const { id } = useParams();
  const [roomOptions, setRoomOptions] = useState([]);
  const [guruList, setGuruList] = useState([]);
  const [formData, setFormData] = useState({
    edu_level: "",
    room_name: "",
    guruId: "",
    school_year: "",
  });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/room/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.data.success) {
          const { room, students } = res.data;
          setFormData({
            edu_level: room.edu_level,
            room_name: room.room_name,
            guruId: room.guruId || "",
            school_year: room.school_year,
          });

          setStartDate(room.startDate ? dayjs(room.startDate) : null);
          setEndDate(room.endDate ? dayjs(room.endDate) : null);

          if (room.edu_level === "SD")
            setRoomOptions(["1", "2", "3", "4", "5", "6"]);
          else if (room.edu_level === "SMP") setRoomOptions(["7", "8", "9"]);
          else if (room.edu_level === "SMA") setRoomOptions(["10", "11", "12"]);

          setStudents(
            students.map((s) => ({
              ...s,
              dob: s.dob ? dayjs(s.dob) : null,
            }))
          );
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error);
        }
      }
    };

    const fetchGuruList = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/guru`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.data.success) {
          setGuruList(res.data.gurus);
        }
      } catch (err) {
        console.error("Error fetching gurus:", err);
      }
    };

    fetchRoomData();
    fetchGuruList();
  }, [id, baseURL]);
  useEffect(() => {
    if (startDate && endDate) {
      const startYear = dayjs(startDate).year();
      const endYear = dayjs(endDate).year();
      setFormData((prev) => ({
        ...prev,
        school_year: `${startYear}/${endYear}`,
      }));
    }
  }, [startDate, endDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "edu_level") {
      let options = [];
      if (value === "SD") options = ["1", "2", "3", "4", "5", "6"];
      else if (value === "SMP") options = ["7", "8", "9"];
      else if (value === "SMA") options = ["10", "11", "12"];
      setRoomOptions(options);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStudentChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...students];
    updated[index][name] = value;
    setStudents(updated);
  };

  const handleDobChange = (index, value) => {
    const updated = [...students];
    updated[index].dob = value;
    setStudents(updated);
  };

  const addStudentField = () => {
    setStudents([
      ...students,
      {
        nik: "",
        name: "",
        gender: "",
        dob: null,
        religion: "",
        address: "",
        parentStd: "",
        parentJob: "",
      },
    ]);
  };

  const removeStudentField = (index) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (startDate && endDate && dayjs(endDate).isBefore(startDate)) {
      alert("Tanggal selesai tidak boleh sebelum tanggal mulai.");
      return;
    }

    try {
      const payload = {
        ...formData,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        students: students.map((s) => ({
          ...s,
          dob: s.dob ? s.dob.toISOString() : null,
        })),
        guruId: formData.guruId === "" ? null : formData.guruId,
      };

      const res = await axios.put(`${baseURL}/api/room/${id}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.data.success) {
        navigate("/admin-dashboard/rooms");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Gagal menyimpan perubahan.");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="mt-10 p-5">
        <h1 className="max-w-4xl mx-auto text-xl font-semibold text-gray-800 mb-2">
          Edit Ruang Kelas
        </h1>
        <div className="max-w-4xl mx-auto flex items-center text-sm text-gray-500 space-x-1">
          <Link to="/admin-dashboard">
            <span className="hover:underline hover:text-color5 cursor-pointer">
              Dashboard
            </span>
          </Link>
          <HiChevronRight className="text-gray-400" />
          <Link to="/admin-dashboard/rooms">
            <span className="hover:underline hover:text-color5 cursor-pointer">
              List
            </span>
          </Link>
          <HiChevronRight className="text-gray-400" />
          <span className="text-color5 cursor-default">Edit</span>
        </div>

        <div className="max-w-4xl mx-auto mt-5 bg-white p-8 rounded-md shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="grid mt-4 grid-cols-1 md:grid-cols-3 space-y-0 gap-2">
              <div>
                <label className="font-semibold text-gray-700">
                  Jenjang Pendidikan
                </label>
                <select
                  name="edu_level"
                  value={formData.edu_level}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Pilih Jenjang</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                </select>
              </div>
              <div className="mt-4">
                <label className="font-semibold text-gray-700">Kelas</label>
                <select
                  name="room_name"
                  value={formData.room_name}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  required
                  disabled={roomOptions.length === 0}
                >
                  <option value="">Pilih Kelas</option>
                  {roomOptions.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4">
                <label className="font-semibold text-gray-700">
                  Wali Kelas
                </label>
                <select
                  name="guruId"
                  value={formData.guruId}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                >
                  <option value="">Pilih Guru</option>
                  {guruList.map((guru) => (
                    <option key={guru._id} value={guru._id}>
                      {guru.userId?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4">
                <label className="font-semibold text-gray-700">
                  Tanggal Mulai
                </label>
                <DatePicker
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                  format="DD-MM-YYYY"
                  className="mt-1 w-full"
                />
              </div>

              <div className="mt-4">
                <label className="font-semibold text-gray-700">
                  Tanggal Selesai
                </label>
                <DatePicker
                  value={endDate}
                  onChange={(date) => setEndDate(date)}
                  format="DD-MM-YYYY"
                  className="mt-1 w-full"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700">
                  Tahun Pelajaran
                </label>
                <input
                  type="text"
                  name="school_year"
                  value={formData.school_year}
                  disabled
                  className="mt-1 p-2 block w-full border border-gray-300 bg-gray-100 rounded-md"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="font-semibold text-gray-700">Data Siswa</label>
              {students.map((student, index) => (
                <div
                  key={index}
                  className="border border-color7 p-3 mt-2 rounded space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-800">
                      Siswa {index + 1}
                    </h2>
                    {students.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStudentField(index)}
                        className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
                      >
                        Hapus Siswa
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="nik"
                      placeholder="Nomor Induk"
                      value={student.nik}
                      onChange={(e) => handleStudentChange(index, e)}
                      className="p-2 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      name="name"
                      placeholder="Nama"
                      value={student.name}
                      onChange={(e) => handleStudentChange(index, e)}
                      className="p-2 border border-gray-300 rounded"
                    />
                    <select
                      name="gender"
                      value={student.gender}
                      onChange={(e) => handleStudentChange(index, e)}
                      className="p-2 border border-gray-300 rounded"
                    >
                      <option value="">Jenis Kelamin</option>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                    <DatePicker
                      name="dob"
                      value={student.dob}
                      onChange={(value) => handleDobChange(index, value)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                        },
                      }}
                    />
                    <select
                      name="religion"
                      value={student.religion}
                      onChange={(e) => handleStudentChange(index, e)}
                      className="p-2 border border-gray-300 rounded"
                    >
                      <option value="">Agama</option>
                      <option value="Islam">Islam</option>
                      <option value="Kristen Protestan">
                        Kristen Protestan
                      </option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Konghucu">Konghucu</option>
                      <option value="Yang lainnya">Yang lainnya</option>
                    </select>
                    <input
                      type="text"
                      name="address"
                      placeholder="Alamat"
                      value={student.address}
                      onChange={(e) => handleStudentChange(index, e)}
                      className="p-2 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      name="parentStd"
                      placeholder="Nama Orang Tua"
                      value={student.parentStd}
                      onChange={(e) => handleStudentChange(index, e)}
                      className="p-2 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      name="parentJob"
                      placeholder="Pekerjaan Orang Tua"
                      value={student.parentJob}
                      onChange={(e) => handleStudentChange(index, e)}
                      className="p-2 border border-gray-300 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addStudentField}
              className="font-semibold text-sm text-white bg-color5 hover:bg-color4 rounded-md p-2 mt-4"
            >
              + Tambah Siswa
            </button>
            <button
              type="submit"
              className="w-full mt-6 bg-color5 hover:bg-color4 text-white font-bold py-2 px-4 rounded"
            >
              Simpan Perubahan
            </button>
          </form>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default EditRoom;
