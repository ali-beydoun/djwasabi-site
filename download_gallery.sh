#!/bin/bash
# Download gallery images from WordPress site

echo "🎧 DJ WASABI - Gallery Image Downloader"
echo "========================================"
echo ""

mkdir -p images

# Gallery images from WordPress
images=(
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/Osama-and-Noor-Wedding.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/462566902_1263069494969799_5436200823142266671_n.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/4abb7b6b-d3ef-4ca8-a448-276f750be484.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/Setup-2-scaled.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/IMG_8361-scaled.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/IMG_8253-scaled.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/1000073084.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/DJ-Wasabi-scaled.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/ef5c0a16-baa6-4666-81dc-906e8cec1090.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/1000072549.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/1000060301.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/1000060300.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/1000039189-scaled.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/1000028134-scaled.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/6678b7a0ee046-1719187360.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/668a4944c0381-1720338756.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/668a499c0124e-1720338844.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/668a499bf11f5-1720338843.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/668a49a06b249-1720338848-scaled.jpg"
    "https://initialmockdesign.com/djwasabi/wp-content/uploads/2025/06/466969011_569795192340981_656555707320999613_n.jpg"
)

total=${#images[@]}
current=0
success=0
skipped=0
failed=0

echo "📥 Downloading $total gallery images..."
echo ""

for url in "${images[@]}"; do
    current=$((current + 1))
    filename=$(basename "$url")

    # Check if file already exists
    if [ -f "images/$filename" ]; then
        echo "[$current/$total] $filename - Already exists, skipping"
        skipped=$((skipped + 1))
        continue
    fi

    echo "[$current/$total] Downloading: $filename"

    if curl -f -s -o "images/$filename" "$url"; then
        success=$((success + 1))
        size=$(ls -lh "images/$filename" | awk '{print $5}')
        echo "  ✅ Downloaded ($size)"
    else
        failed=$((failed + 1))
        echo "  ❌ Failed"
    fi
    echo ""
done

echo "========================================"
echo "📊 SUMMARY"
echo "  ✅ Downloaded: $success"
echo "  ⏭️  Skipped: $skipped"
echo "  ❌ Failed: $failed"
echo ""
echo "✨ Done!"
