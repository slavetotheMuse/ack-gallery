#!/usr/bin/env python3
from PIL import Image
import os
from pathlib import Path

def get_dominant_color(image_path):
    """Extract dominant color from image"""
    try:
        img = Image.open(image_path)
        img = img.convert('RGB')
        # Resize for faster processing
        img.thumbnail((150, 150))
        # Get all pixels and find dominant color
        pixels = list(img.getdata())
        r = sum(p[0] for p in pixels) // len(pixels)
        g = sum(p[1] for p in pixels) // len(pixels)
        b = sum(p[2] for p in pixels) // len(pixels)
        return (r, g, b)
    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        return (100, 100, 100)

def create_palette(r, g, b):
    """Create palette object with given RGB values"""
    return {
        'body': f'rgb({r},{g},{b})',
        'border': f'rgba({r},{g},{b},0.85)',
        'header': f'rgba({r},{g},{b},0.92)',
        'accent': f'rgb({r},{g},{b})',
        'accentDim': f'rgba({r},{g},{b},0.75)',
        'accentGlow': f'rgba({r},{g},{b},0.06)',
        'headerText': '#e0e0de'
    }

def format_palette_line(filename, palette):
    """Format palette as JavaScript object"""
    return f"'warothy/web/{filename}': {{body:'{palette['body']}',border:'{palette['border']}',header:'{palette['header']}',accent:'{palette['accent']}',accentDim:'{palette['accentDim']}',accentGlow:'{palette['accentGlow']}',headerText:'{palette['headerText']}'}}"

# Get all web files
web_dir = Path('/sessions/practical-lucid-newton/mnt/servantcoinspin/ack-gallery/warothy/web')
files = sorted([f for f in web_dir.glob('*.gif') if f.is_file()])

print(f"Found {len(files)} GIF files\n")

palettes = []
for filepath in files:
    filename = filepath.name
    print(f"Processing {filename}...")
    color = get_dominant_color(str(filepath))
    palette = create_palette(*color)
    line = format_palette_line(filename, palette)
    palettes.append(line)

print("\n" + "="*80)
print("JAVASCRIPT PALETTE LINES:")
print("="*80 + "\n")

for line in palettes:
    print(line)

print("\n" + "="*80)
print(f"Total: {len(palettes)} palette lines")
