from PIL import Image
import os

def swap_green_to_blue(image_path, output_path):
    img = Image.open(image_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    # Brand blue is (8, 23, 54). Let's use a slightly brighter blue for the ampersand to make it visible
    # Vibrant blue: (0, 120, 215) or similar
    target_blue = (0, 150, 255, 255) 

    for item in datas:
        # Check if the pixel is "greenish"
        # Lime green usually has high Green and lower Red/Blue
        r, g, b, a = item
        if a > 0: # Not transparent
            # Heuristic for green ampersand: Green is significantly higher than Red and Blue
            if g > r * 1.2 and g > b * 1.2:
                # Calculate a new blue based on the original green intensity to preserve gradients
                intensity = g / 255.0
                new_blue = (int(0 * intensity), int(150 * intensity), int(255 * intensity), a)
                new_data.append(new_blue)
            else:
                new_data.append(item)
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")

logo_path = r"c:\Users\DELL\OneDrive\Pictures\Documents\K&K CLEANING SERVICES\Asset\logo_transparent.png"
output_path = r"c:\Users\DELL\OneDrive\Pictures\Documents\K&K CLEANING SERVICES\Asset\logo_transparent.png" # Overwrite

swap_green_to_blue(logo_path, output_path)
print(f"Logo color swapped successfully at: {output_path}")
