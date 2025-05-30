# --- 📦 1. Import libraries ---
from PIL import Image, ImageDraw
import matplotlib.pyplot as plt
import numpy as np
import cv2

# --- 📂 2. Load image ---
image_path = "./org/IMG_4189.JPG"  # Replace with your file path
img = Image.open(image_path).convert("RGB")
w, h = img.size
print(f"Original image size: {w}x{h}")

img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
strip_width = 150
left = img[:, :strip_width]
right = img[:, -strip_width:]

# Step 2: Flip right strip and align manually or using feature matching (optional)

# Step 3: Blend them using cv2.addWeighted or fancy stuff like Laplacian pyramids
blended_strip = cv2.addWeighted(left, 0.5, right, 0.5, 0)

# Step 4: Replace the seam (or average across the strip)
img[:, :strip_width] = blended_strip
img[:, -strip_width:] = blended_strip

# Convert back to PIL to display
final_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
# final_img.show()

img = final_img

# --- 🖱️ 3. Let user click up to 3 horizon points ---
plt.imshow(img)
plt.title("Click up to 3 points to define the horizon")
plt.axis('off')
clicked_points = plt.ginput(3, timeout=0)
plt.close()

# --- 🧮 4. Average horizon y-coordinate ---
if not clicked_points:
    raise ValueError("No points were selected.")
avg_horizon_y = int(np.mean([pt[1] for pt in clicked_points]))
print(f"Averaged horizon Y = {avg_horizon_y}")

# --- 🧱 5. Pad image to reach 2:1 (equirectangular) ---
def pad_to_equirectangular_with_horizon(img, horizon_y, target_aspect=2.0):
    w, h = img.size
    new_h = int(w / target_aspect)
    total_padding = new_h - h

    if total_padding < 0:
        raise ValueError(f"Image is already taller than target equirectangular size ({new_h}px).")

    # Bias padding depending on where the horizon is in the original image
    # If horizon is high -> more ground -> pad more on top
    # If horizon is low  -> more sky -> pad more on bottom
    percent_horizon = horizon_y / h
    pad_below = int(total_padding * percent_horizon)   # more padding below if horizon is low
    pad_above = total_padding - pad_below              # remaining goes on top


    new_img = Image.new("RGB", (w, new_h), (0, 0, 0))
    new_img.paste(img, (0, pad_above))
    return new_img, pad_above

padded_img, offset = pad_to_equirectangular_with_horizon(img, avg_horizon_y)
print(f"Padded image size: {padded_img.size}, padding above: {offset}, below: {padded_img.size[1] - h - offset}")

# final_img = draw_center_line(padded_img.copy())
final_img = padded_img

# --- 🖼️ 7. Show final image ---
plt.imshow(final_img)
plt.title("Padded to Equirectangular with Center Line")
plt.axis('off')
# plt.show()

# --- 💾 8. Save result ---
final_img.save(image_path.replace("./org/", ""))
print("✅ Saved as final_padded_equirectangular.jpg")
