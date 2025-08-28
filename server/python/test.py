import cv2
import os

img_path = "converted_faces/_fixed_temp.jpg"
output_path = "converted_faces/_cv2_fixed.jpg"

# Baca dengan OpenCV
img = cv2.imread(img_path)
if img is None:
    print("❌ Gagal membaca gambar dengan OpenCV")
else:
    # Konversi BGR ke RGB (face_recognition pakai RGB)
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    # Simpan ulang ke JPEG
    cv2.imwrite(output_path, rgb)
    print(f"✅ Gambar disimpan ulang dengan OpenCV ke {output_path}")
