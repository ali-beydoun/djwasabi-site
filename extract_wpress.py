#!/usr/bin/env python3
"""
Extract images, content, and data from a .wpress WordPress backup file.
A .wpress file is a custom archive format used by All-in-One WP Migration plugin.
"""

import os
import sys
import zipfile
import shutil
from pathlib import Path

def extract_wpress(wpress_file, output_dir):
    """
    Extract contents from .wpress file

    Args:
        wpress_file: Path to .wpress file
        output_dir: Directory to extract to
    """
    print(f"🎧 DJ WASABI - .wpress Extractor")
    print(f"=" * 60)
    print(f"📁 Input file: {wpress_file}")
    print(f"📂 Output dir: {output_dir}")
    print()

    # Create output directory
    os.makedirs(output_dir, exist_ok=True)

    # .wpress files are actually zip archives with a custom extension
    try:
        print("🔍 Attempting to extract as ZIP archive...")
        with zipfile.ZipFile(wpress_file, 'r') as zip_ref:
            # List all files
            file_list = zip_ref.namelist()
            print(f"✅ Found {len(file_list)} files in archive")
            print()

            # Extract everything
            print("📦 Extracting all files...")
            zip_ref.extractall(output_dir)
            print("✅ Extraction complete!")
            print()

            # Analyze what we extracted
            images_found = []
            db_files = []
            other_files = []

            for filename in file_list:
                ext = os.path.splitext(filename)[1].lower()
                if ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']:
                    images_found.append(filename)
                elif ext in ['.sql', '.json']:
                    db_files.append(filename)
                else:
                    other_files.append(filename)

            # Report findings
            print("📊 EXTRACTION SUMMARY:")
            print(f"  🖼️  Images: {len(images_found)}")
            print(f"  💾 Database files: {len(db_files)}")
            print(f"  📄 Other files: {len(other_files)}")
            print()

            if images_found:
                print("🖼️  IMAGE FILES:")
                for img in images_found[:20]:  # Show first 20
                    print(f"  - {img}")
                if len(images_found) > 20:
                    print(f"  ... and {len(images_found) - 20} more")
                print()

            if db_files:
                print("💾 DATABASE FILES:")
                for db in db_files:
                    print(f"  - {db}")
                print()

            # Create organized folders
            print("📁 Organizing extracted files...")

            # Create images directory
            images_dir = os.path.join(output_dir, 'extracted_images')
            os.makedirs(images_dir, exist_ok=True)

            # Copy images to organized folder
            copied_images = 0
            for img in images_found:
                src = os.path.join(output_dir, img)
                if os.path.exists(src):
                    dest = os.path.join(images_dir, os.path.basename(img))
                    # Avoid duplicates
                    if not os.path.exists(dest):
                        shutil.copy2(src, dest)
                        copied_images += 1

            print(f"✅ Copied {copied_images} unique images to: {images_dir}")
            print()

            # Find WordPress uploads directory
            for root, dirs, files in os.walk(output_dir):
                if 'uploads' in root:
                    print(f"📂 Found uploads directory: {root}")

            return True

    except zipfile.BadZipFile:
        print("❌ File is not a valid ZIP archive")
        print("🔄 Trying alternative extraction method...")

        # Try treating it as a different archive format
        try:
            import tarfile
            print("🔍 Attempting to extract as TAR archive...")
            with tarfile.open(wpress_file, 'r') as tar_ref:
                tar_ref.extractall(output_dir)
                print("✅ Extraction complete!")
                return True
        except Exception as e:
            print(f"❌ TAR extraction failed: {e}")
            return False

    except Exception as e:
        print(f"❌ Error during extraction: {e}")
        return False

def main():
    # Default paths
    wpress_file = os.path.expanduser("~/Downloads/initialmockdesign-com-djwasabi-20250825-024729-uhwn3io1lqf8 (1).wpress")
    output_dir = os.path.expanduser("~/Documents/VSCodeProjects/djwasabi-site/wpress-extracted")

    # Check if file exists
    if not os.path.exists(wpress_file):
        print(f"❌ Error: File not found: {wpress_file}")
        sys.exit(1)

    # Extract
    success = extract_wpress(wpress_file, output_dir)

    if success:
        print()
        print("=" * 60)
        print("✅ EXTRACTION COMPLETE!")
        print(f"📂 Files extracted to: {output_dir}")
        print()
        print("Next steps:")
        print("  1. Check 'extracted_images' folder for usable images")
        print("  2. Review database.sql for content/text")
        print("  3. Copy needed images to your images/ folder")
    else:
        print()
        print("=" * 60)
        print("❌ EXTRACTION FAILED")
        print("The .wpress file may be encrypted or corrupted.")
        sys.exit(1)

if __name__ == "__main__":
    main()
