import face_recognition

try:
    image = face_recognition.load_image_file("converted_faces/_cv2_fixed.jpg")
    encodings = face_recognition.face_encodings(image)
    if encodings:
        print(f"✅ Wajah terdeteksi! Jumlah wajah: {len(encodings)}")
    else:
        print("🚫 Tidak ada wajah terdeteksi.")
except Exception as e:
    print(f"❌ Error: {e}")
