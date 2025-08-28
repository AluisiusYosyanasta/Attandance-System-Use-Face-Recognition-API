import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import * as faceapi from "face-api.js";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { HiChevronRight } from "react-icons/hi";

const FaceRecognition = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const scheduleIds = params.getAll("id");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [result, setResult] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [detectionRunning, setDetectionRunning] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const baseURL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const loadFaceApiModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    };

    loadFaceApiModels();
  }, []);

  useEffect(() => {
    let detectionInterval;
    let sentRecently = false;

    const startFaceDetection = async () => {
      detectionInterval = setInterval(async () => {
        if (!videoRef.current || !cameraOn || !detectionRunning || sentRecently)
          return;

        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );

        if (detections.length > 0) {
          console.log("Wajah terdeteksi!");

          const canvas = document.createElement("canvas");
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageData = canvas.toDataURL("image/jpeg");

          try {
            setResult("⏳ Menganalisis Wajah ...");
            const res = await axios.post(
              `${baseURL}/api/presensi/recognize`,
              { image: imageData, scheduleIds },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            const data = res.data;
            setResult(data.message || "❓ Tidak ada respon");

            if (data.success && data.student) {
              const firstSchedule = data.schedules?.[0];

              const newEntry = {
                id: data.student._id,
                name: data.student.name,
                class: data.student.class,
                time: new Date().toLocaleTimeString("id-ID"),
                status: "hadir",
                subject: firstSchedule?.subject || "-",
                guru: firstSchedule?.guru || "-",
              };

              setStudentList((prevList) => {
                const alreadyExists = prevList.some(
                  (s) => s.id === newEntry.id
                );
                return alreadyExists ? prevList : [...prevList, newEntry];
              });
            }

            sentRecently = true;
            setTimeout(() => {
              sentRecently = false;
            }, 10000);
          } catch (err) {
            console.error("⚠️ Error:", err.response?.data || err.message);
            setResult("⚠️ Gagal mengenali wajah");
          }
        }
      }, 1000);
    };

    if (cameraOn && detectionRunning) startFaceDetection();
    return () => clearInterval(detectionInterval);
  }, [cameraOn, detectionRunning, scheduleIds, baseURL]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setCameraOn(true);
      setResult("🎥 Kamera aktif");
    } catch (err) {
      console.error("❌ Gagal mengakses kamera:", err);
      setResult("❌ Kamera gagal diakses");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
    setDetectionRunning(false);
    setResult("🛑 Kamera dimatikan");
  };

  const startDetection = () => {
    if (!cameraOn) {
      setResult("⚠️ Kamera belum aktif");
      return;
    }
    setDetectionRunning(true);
    setResult("🔍 Deteksi wajah dimulai");
  };

  useEffect(() => {
    document.title = "Presensi | Sistem Kehadiran";
    return () => stopCamera();
  }, []);

  return (
    <div className="p-5 mt-10 max-w-5xl mx-auto space-y-3">
      <h1 className="text-xl font-semibold text-gray-800">
        🎥 Presensi dengan Wajah Siswa
      </h1>

      <div className="flex items-center text-sm text-gray-500 space-x-1 ">
        <Link to="/guru-dashboard">
          <span className="hover:underline hover:text-color5 cursor-pointer">
            Dashboard
          </span>
        </Link>
        <HiChevronRight className="text-gray-400" />
        <Link to="/guru-dashboard/guru-schedule">
          <span className="hover:underline text-color5 cursor-pointer">
            Presensi
          </span>
        </Link>
      </div>

      <div className="flex flex-col items-center gap-4">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full max-w-sm md:max-w-md lg:max-w-lg aspect-video object-cover object-center rounded shadow"
        />

        <div className="flex gap-2">
          {!cameraOn ? (
            <button
              onClick={startCamera}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              🎥 Buka Kamera
            </button>
          ) : (
            <>
              <button
                onClick={stopCamera}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                🛑 Tutup Kamera
              </button>
              <button
                onClick={startDetection}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                🔍 Deteksi Wajah
              </button>
            </>
          )}
        </div>

        <p className="text-lg font-semibold">{result}</p>

        {studentList.length > 0 && (
          <>
            <div className="mt-4 p-4 border rounded shadow w-full overflow-x-auto bg-gray-50">
              <table className="w-full text-sm text-gray-700 border border-color5">
                <thead className="bg-color5 text-white">
                  <tr>
                    <th className="border border-color5 px-4 py-2 text-center">
                      Nama
                    </th>
                    <th className="border border-color5 px-4 py-2 text-center">
                      Kelas
                    </th>
                    <th className="border border-color5 px-4 py-2 text-center">
                      Jam Absen
                    </th>
                    <th className="border border-color5 px-4 py-2 text-center">
                      Status
                    </th>
                    <th className="border border-color5 px-4 py-2 text-center">
                      Mata Pelajaran
                    </th>
                    <th className="border border-color5 px-4 py-2 text-center">
                      Guru
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {studentList.map((student, idx) => (
                    <tr
                      key={student.id || idx}
                      className="bg-white hover:bg-gray-100"
                    >
                      <td className="border border-color5 px-4 py-2 text-center">
                        {student.name}
                      </td>
                      <td className="border border-color5 px-4 py-2 text-center">
                        {student.class}
                      </td>
                      <td className="border border-color5 px-4 py-2 text-center">
                        {student.time}
                      </td>
                      <td className="border border-color5 px-4 py-2 text-center">
                        {student.status}
                      </td>
                      <td className="border border-color5 px-4 py-2 text-center">
                        {student.subject}
                      </td>
                      <td className="border border-color5 px-4 py-2 text-center">
                        {student.guru}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() =>
                navigate("/guru-dashboard/presensi/confirm", {
                  state: { studentList, scheduleIds },
                })
              }
              className="mt-4 text-sm sm:text-base bg-color5 hover:bg-color4 rounded-md text-white text-center px-4 py-2 shadow"
            >
              Konfirmasi & Simpan Presensi
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FaceRecognition;
