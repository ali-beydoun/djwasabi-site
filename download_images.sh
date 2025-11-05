#!/bin/bash
# Download images from WordPress site

echo "🎧 DJ WASABI - Image Downloader"
echo "================================"
echo ""

# Create images directory if it doesn't exist
mkdir -p images

# Array of image URLs
images=(
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/Logo-3.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/headphone-1.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/dj-mixer_3233833.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/hierarchy_17052643.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/Group-62.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/Group-63.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/Mask-group-1.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/Group-49.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/Mask-group.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/Group-48.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/COMPO3.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/Component-2-e1755578765641.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/COMPO4.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/COMPO36.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/Mask-group-1.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/Mask-group-3.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/Mask-group-2.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/Group-50.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/Group-1.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/Group-2.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/WASABI.gif"
)

# Counter
total=${#images[@]}
current=0
success=0
failed=0

echo "📥 Downloading $total images..."
echo ""

# Download each image
for url in "${images[@]}"; do
    current=$((current + 1))
    filename=$(basename "$url")

    echo "[$current/$total] Downloading: $filename"

    if curl -f -s -o "images/$filename" "$url"; then
        success=$((success + 1))
        echo "  ✅ Success"
    else
        failed=$((failed + 1))
        echo "  ❌ Failed"
    fi
    echo ""
done

echo "================================"
echo "📊 DOWNLOAD SUMMARY"
echo "  ✅ Success: $success"
echo "  ❌ Failed: $failed"
echo "  📁 Saved to: ./images/"
echo ""
echo "✨ Done!"
