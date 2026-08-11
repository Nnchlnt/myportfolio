from PIL import Image
import os

def remove_background(image_path, output_path, tolerance=40):
    img = Image.open(image_path).convert("RGBA")
    datas = img.getdata()

    # Get background color from top-left pixel
    bg_color = datas[0]
    
    new_data = []
    for item in datas:
        # Check if pixel is close to background color
        if all(abs(item[i] - bg_color[i]) <= tolerance for i in range(3)):
            new_data.append((255, 255, 255, 0)) # Transparent
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")
    return bg_color

logo_path = r"c:\Users\DELL\OneDrive\Pictures\Documents\K&K CLEANING SERVICES\Asset\logo.jpeg"
output_path = r"c:\Users\DELL\OneDrive\Pictures\Documents\K&K CLEANING SERVICES\Asset\logo_transparent.png"

bg_color = remove_background(logo_path, output_path)
print(f"Background color found: {bg_color}")
print(f"Transparent logo saved to: {output_path}")
