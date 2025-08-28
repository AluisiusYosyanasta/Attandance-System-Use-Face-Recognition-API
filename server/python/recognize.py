import face_recognition
import os
import json
import numpy as np
from PIL import Image

# 📁 Path folder database wajah
face_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "converted_faces/"))

known_faces = []
known_names = []

# 🔁 Load semua wajah dan encoding-nya
for filename in os.listdir(face_dir):
    if filename.lower().endswith((".jpg", ".jpeg", ".png")):
        try:
            full_path = os.path.join(face_dir, filename)
            with Image.open(full_path) as img:
                rgb = img.convert("RGB")
                img_array = np.array(rgb)
                enc = face_recognition.face_encodings(img_array)
                if enc:
                    known_faces.append(enc[0])
                    known_names.append(os.path.splitext(filename)[0])
        except Exception as e:
            print(f"Gagal membaca {filename}: {e}")

# ✅ Bandingkan setiap wajah dengan yang lain
results = []

for i in range(len(known_faces)):
    for j in range(len(known_faces)):
        if i == j:
            continue  # skip perbandingan dengan dirinya sendiri

        match = face_recognition.compare_faces([known_faces[i]], known_faces[j])[0]
        distance = face_recognition.face_distance([known_faces[i]], known_faces[j])[0]
        similarity = round(1 - distance, 4)

        results.append({
            "source": known_names[i],
            "target": known_names[j],
            "match": match,
            "similarity": similarity
        })

# ✅ Output JSON
print(json.dumps(results, indent=2))
