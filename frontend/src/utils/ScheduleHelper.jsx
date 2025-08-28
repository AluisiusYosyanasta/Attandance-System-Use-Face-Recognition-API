import axios from "axios";

export const fetchSubjects = async () => {
  const baseURL = import.meta.env.VITE_API_URL;
  try {
    const response = await axios.get(`${baseURL}/api/subject`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (response.data.success) {
      return response.data.subjects || [];
    } else {
      return [];
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      alert(error.response.data.error);
    }
    return [];
  }
};

export const fetchRooms = async () => {
  const baseURL = import.meta.env.VITE_API_URL;
  try {
    const response = await axios.get(`${baseURL}/api/room`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (response.data.success) {
      return response.data.rooms || [];
    } else {
      return [];
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      alert(error.response.data.error);
    }
    return [];
  }
};

export const fetchGurus = async () => {
  const baseURL = import.meta.env.VITE_API_URL;
  try {
    const response = await axios.get(`${baseURL}/api/guru`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data.gurus || [];
  } catch (error) {
    console.error("Error fetching gurus:", error);
    return [];
  }
};

export const fetchGurusBySubject = async (subjectId) => {
  const baseURL = import.meta.env.VITE_API_URL;
  try {
    const response = await axios.get(
      `${baseURL}/api/guru/by-subject/${subjectId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data.gurus || [];
  } catch (error) {
    console.error("Error fetching gurus by subject:", error);
    return [];
  }
};
