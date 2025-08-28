import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

export const RoomButtons = ({ _id, onRoomDelete }) => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const baseURL = import.meta.env.VITE_API_URL;

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`${baseURL}/api/room/${_id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data.success) {
        onRoomDelete();
        setShowConfirm(false);
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      }
    }
  };

  return (
    <>
      <div className="flex space-x-3">
        <button
          className="px-3 py-2 rounded bg-color5 hover:bg-color4 text-white hover:font-semibold text-sm transition"
          onClick={() => navigate(`/admin-dashboard/room/students/${_id}`)}
        >
          Daftar Siswa
        </button>
        <button
          className="px-3 py-2 rounded bg-color5 hover:bg-color4 text-white hover:font-semibold text-sm transition"
          onClick={() => navigate(`/admin-dashboard/room/${_id}`)}
        >
          Edit
        </button>
        <button
          className="px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white hover:font-semibold text-sm transition"
          onClick={() => setShowConfirm(true)}
        >
          Delete
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-100">
            <h2 className="text-lg font-semibold mb-4">Konfirmasi Hapus</h2>
            <p className="mb-4">
              Apakah Anda yakin akan menghapus kelas dan siswa ini?
            </p>
            <div className="flex justify-end space-x-3 mt-10">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-1 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
