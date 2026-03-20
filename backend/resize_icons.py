from PIL import Image
import os

source_path = r'C:\Users\V.harshith\.gemini\antigravity\brain\20a4e394-b161-4689-9dfc-cfe5425ff30d\pwa_icon_academic_1774002580789.png'
public_dir = r'd:\ExamSeatingArrangement\frontend\public'

# Sizes to generate
sizes = [(192, 192), (512, 512)]

if os.path.exists(source_path):
    with Image.open(source_path) as img:
        for size in sizes:
            resized_img = img.resize(size, Image.Resampling.LANCZOS)
            output_name = f'pwa-{size[0]}x{size[1]}.png'
            output_path = os.path.join(public_dir, output_name)
            resized_img.save(output_path)
            print(f"Generated {output_path}")
else:
    print(f"Source image not found: {source_path}")
