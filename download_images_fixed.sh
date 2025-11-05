#!/bin/bash
# Download images from WordPress site with correct paths

echo "🎧 DJ WASABI - Image Downloader (Fixed URLs)"
echo "============================================="
echo ""

# Create images directory if it doesn't exist
mkdir -p images

# Array of image URLs with correct month folders
images=(
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/Logo-3.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/headphone-1.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/07/dj-mixer_3233833.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/07/hierarchy_17052643.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/07/Group-62.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/07/Group-63.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/08/COMPO3.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/08/Component-2-e1755578765641.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/08/COMPO4.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/08/COMPO36.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/Mask-group-1.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/05/Mask-group-3.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/Mask-group-2.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/Group-50.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/Mask-group-1.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/Group-49.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/Mask-group.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/Group-48.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/Group-1.png"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/Group-2.png"
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
    echo "  URL: $url"

    if curl -f -s -o "images/$filename" "$url"; then
        success=$((success + 1))
        size=$(ls -lh "images/$filename" | awk '{print $5}')
        echo "  ✅ Success ($size)"
    else
        failed=$((failed + 1))
        echo "  ❌ Failed"
    fi
    echo ""
done

echo "============================================="
echo "📊 DOWNLOAD SUMMARY"
echo "  ✅ Success: $success"
echo "  ❌ Failed: $failed"
echo "  📁 Saved to: ./images/"
echo ""

if [ $success -gt 0 ]; then
    echo "🖼️  Downloaded images:"
    ls -lh images/ | grep -E '\.(png|jpg|gif)$'
fi

echo ""
echo "✨ Done!"
