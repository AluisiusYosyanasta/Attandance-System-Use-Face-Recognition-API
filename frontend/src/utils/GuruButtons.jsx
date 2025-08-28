import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const GuruButtons = ({ _id, onGuruDelete }) => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const baseURL = import.meta.env.VITE_API_URL;

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`${baseURL}/api/guru/${_id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data.success) {
        onGuruDelete();
        setShowConfirm(false);
      }
    } catch (error) {
      alert(error.response?.data?.error || "Gagal menghapus guru");
    }
  };

  return (
    <>
      <div className="flex space-x-3">
        <button
          className="px-3 py-2 rounded bg-color5 hover:bg-color4 text-white hover:font-semibold font-medium text-sm transition"
          onClick={() => navigate(`/admin-dashboard/guru-guru/${_id}`)}
        >
          View
        </button>
        <button
          className="px-3 py-2 rounded bg-amber-400 hover:bg-amber-500 text-white hover:font-semibold font-medium text-sm transition"
          onClick={() => navigate(`/admin-dashboard/guru-guru/edit/${_id}`)}
        >
          Edit
        </button>
        <button
          className="px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white hover:font-semibold font-medium text-sm transition"
          onClick={() => setShowConfirm(true)}
        >
          Delete
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white w-full max-w-sm mx-4 p-6 rounded shadow-lg">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">
              Konfirmasi
            </h2>
            <p className="text-sm text-gray-600">
              Apakah Anda yakin ingin menghapus guru ini?
            </p>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
