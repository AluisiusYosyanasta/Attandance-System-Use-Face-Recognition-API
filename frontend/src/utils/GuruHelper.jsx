import axios from "axios";

export const fetchSubjects = async () => {
  let subjects;
  const baseURL = import.meta.env.VITE_API_URL;
  try {
    const response = await axios.get(`${baseURL}/api/subject`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (response.data.success) {
      subjects = response.data.subjects;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      alert(error.response.data.error);
    }
  }
  return subjects;
};
