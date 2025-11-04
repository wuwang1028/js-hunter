#!/bin/bash
# 创建简单的占位图标
for size in 16 48 128; do
  convert -size ${size}x${size} xc:transparent \
    -fill "#00d4ff" \
    -draw "circle $((size/2)),$((size/2)) $((size/2)),$((size/4))" \
    -fill white \
    -pointsize $((size/3)) \
    -gravity center \
    -annotate +0+0 "JS" \
    icon${size}.png 2>/dev/null || echo "<!-- Icon ${size}x${size} -->" > icon${size}.png
done
