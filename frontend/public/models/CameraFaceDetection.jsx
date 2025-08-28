import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const CameraFaceDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detected, setDetected] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera access denied", err);
      }
    };

    const loadModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    };

    loadModels().then(startVideo);
  }, []);

  const handleVideoOnPlay = () => {
    const interval = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;

      const detections = await faceapi.detectAllFaces(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      );

      setDetected(detections.length > 0);

      const canvas = canvasRef.current;
      const displaySize = {
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      };

      faceapi.matchDimensions(canvas, displaySize);
      const resized = faceapi.resizeResults(detections, displaySize);
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resized);
    }, 200);

    return () => clearInterval(interval);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Face Detection with Camera</h2>

      {/* Form Nama dan Umur */}
      <form style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Masukkan Nama"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: "10px", padding: "6px" }}
        />
        <input
          type="number"
          placeholder="Masukkan Umur"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          style={{ padding: "6px" }}
        />
      </form>

      <div style={{ position: "relative", display: "inline-block" }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          width="640"
          height="480"
          onPlay={handleVideoOnPlay}
          style={{ borderRadius: "8px" }}
        />
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          style={{ position: "absolute", top: 0, left: 0 }}
        />

        {/* Keterangan deteksi wajah dan identitas */}
        {detected && (
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              backgroundColor: "rgba(0, 255, 0, 0.8)",
              padding: "10px 14px",
              borderRadius: "6px",
              fontWeight: "bold",
              color: "#000",
              textAlign: "left",
            }}
          >
            <div>Muka terdeteksi</div>
            {name && <div>Nama: {name}</div>}
            {age && <div>Umur: {age}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraFaceDetection;
