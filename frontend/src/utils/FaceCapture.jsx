import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";

const FaceCapture = () => {
  const webcamRef = useRef(null);
  const [message, setMessage] = useState("");
  const baseURL = import.meta.env.VITE_API_URL;

  const capture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    try {
      const res = await axios.post(`${baseURL}/absen`, {
        image: imageSrc,
      });
      setMessage(res.data.message);
    } catch (error) {
      if (error.response && !error.response.data.success) {
        setMessage("Error submitting attendance");
      }
    }
  };

  return (
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={350}
      />
      <button onClick={capture}>Absen</button>
      <p>{message}</p>
    </div>
  );
};

export default FaceCapture;
