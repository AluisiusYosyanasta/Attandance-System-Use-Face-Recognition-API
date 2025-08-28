from PIL import Image
import os

face_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../public/face_images"))
save_dir = os.path.join(os.path.dirname(__file__), "converted_faces")
os.makedirs(save_dir, exist_ok=True)

for filename in os.listdir(face_dir):
    if filename.lower().endswith((".jpg", ".jpeg", ".png")):
        file_path = os.path.join(face_dir, filename)
        save_path = os.path.join(save_dir, os.path.splitext(filename)[0] + ".jpg")
        try:
            with Image.open(file_path) as img:
                rgb = img.convert("RGB")

                # ⛔ FIX: Jangan gunakan 'JPEG' tanpa format yang pasti
                rgb.save(save_path, format="JPEG", quality=95, subsampling=0)

                print(f"✅ Disimpan ulang (JPEG valid): {save_path}")
        except Exception as e:
            print(f"❌ Gagal buka {filename}: {e}")
