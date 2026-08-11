from PIL import Image
import os

def get_dominant_color(image_path):
    img = Image.open(image_path)
    img = img.resize((50, 50))
    colors = img.getcolors(2500)
    if colors:
        return max(colors, key=lambda x: x[0])[1]
    return None

assets_dir = r"c:\Users\DELL\OneDrive\Pictures\Documents\K&K CLEANING SERVICES\Asset"
files = ["k10.jpeg", "k11.jpeg", "k12.jpeg"]

for f in files:
    path = os.path.join(assets_dir, f)
    if os.path.exists(path):
        dominant = get_dominant_color(path)
        print(f"{f}: {dominant}")
