#!/usr/bin/env bash
# ============================================================================
# 童仔 GH 吉祥物 → PWA icon 一鍵重建
# ----------------------------------------------------------------------------
# 用法：
#   bash tools/build-mascot.sh                       # 用 img/ghmeeting_mascot.png
#   bash tools/build-mascot.sh img/mascot-src-a.png  # 指定來源（白底都得）
#   GRADE=0 bash tools/build-mascot.sh               # 唔做配色加濃（來源已經係品牌色）
#
# 輸出：
#   img/ghmeeting_mascot.png    1024² 去背透明（全域用嘅吉祥物原檔）
#   icons/icon-512.png           512² 透明（PWA any）
#   icons/icon-192.png           192² 透明（PWA any）
#   icons/icon-512-maskable.png  512² 小童軍綠底（PWA maskable 安全區 60%）
#   icons/apple-touch-icon.png   180² 小童軍綠底（iOS 唔支援透明）
#   icons/icon-48.png             48² 透明（favicon / 細圖示）
#
# 掉換吉祥物：將新嘅 ghmeeting_mascot.png（去背透明 1024²）蓋過 img/ 嗰張，
#             再跑一次呢個 script 就得。
# ============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

SRC="${1:-img/ghmeeting_mascot.png}"
GRADE="${GRADE:-1}"
GREEN="#6BBE66"
PAPER="#FFFBF0"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

[ -f "$SRC" ] || { echo "❌ 搵唔到來源圖：$SRC"; exit 1; }

echo "① 讀入 $SRC ..."
# 來源未必係 1024²：先等比縮到 1024 內再補正方（縮細，唔係裁中間！）
convert "$SRC" -background none -gravity center -resize 1024x1024 -extent 1024x1024 "$TMP/sq.png"
# 角落已經透明＝來源已去背 → 唔使再做 floodfill
CORNER_A=$(convert "$TMP/sq.png" -format "%[fx:int(255*a)]" info: 2>/dev/null || echo 255)
if [ "$CORNER_A" = "0" ]; then ALREADY_CUT=1; else ALREADY_CUT=0; fi
[ "$ALREADY_CUT" = "1" ] && echo "   來源已去背 → skip floodfill"

# ② 配色：水彩掃描／AI 稿通常偏灰，加濃飽和 + 輕微對比，拉近品牌色板
if [ "$GRADE" = "1" ]; then
  convert "$TMP/sq.png" -modulate 100,132,100 -sigmoidal-contrast 2.2,52% "$TMP/graded.png"
else
  cp "$TMP/sq.png" "$TMP/graded.png"
fi

# ③ 去背：由四角＋四邊中點 floodfill（fuzz 容忍水彩紙紋），再清走細碎孤島
if [ "$ALREADY_CUT" = "1" ]; then
  echo "② 去背：來源已有透明底，只做去雜點..."
  convert "$TMP/graded.png" -alpha extract \
    -define connected-components:area-threshold=520 \
    -define connected-components:mean-color=true \
    -connected-components 4 "$TMP/cc.png"
  convert "$TMP/graded.png" "$TMP/cc.png" -alpha off -compose CopyOpacity -composite "$TMP/mat.png"
else
echo "② 去背（floodfill + 去雜點）..."
convert "$TMP/graded.png" -alpha set -channel RGBA -fuzz 12% -fill none \
  -draw "color 0,0 floodfill"       -draw "color 1023,0 floodfill" \
  -draw "color 0,1023 floodfill"    -draw "color 1023,1023 floodfill" \
  -draw "color 511,0 floodfill"     -draw "color 0,511 floodfill" \
  -draw "color 1023,511 floodfill"  -draw "color 511,1023 floodfill" \
  +channel "$TMP/mat1.png"

# 清孤島（面積 < 0.05% = 紙紋／飛白）+ 收邊（blur 反鋸齒）+ 實化
convert "$TMP/mat1.png" -alpha extract \
  -define connected-components:area-threshold=520 \
  -define connected-components:mean-color=true \
  -connected-components 4 "$TMP/cc.png"
convert "$TMP/mat1.png" "$TMP/cc.png" -alpha off -compose CopyOpacity -composite "$TMP/mat2.png"
convert "$TMP/mat2.png" -channel A -blur 0x0.7 -level 12%,88% +channel "$TMP/mat.png"
fi

# ④ 裁到實心外框，再補 8% 白邊（安全邊距），復原 1024²
echo "③ 裁切 + 補安全邊距..."
BBOX=$(convert "$TMP/mat.png" -alpha extract -trim -format "%wx%h+%X+%Y" info:)
W=$(echo "$BBOX" | cut -dx -f1); H=$(echo "$BBOX" | cut -d'+' -f1 | cut -dx -f2)
X=$(echo "$BBOX" | cut -d'+' -f2); Y=$(echo "$BBOX" | cut -d'+' -f3)
SIDE=$(( W > H ? W : H )); PAD=$(( SIDE * 8 / 100 )); FULL=$(( SIDE + PAD * 2 ))
convert "$TMP/mat.png" -crop "${W}x${H}+${X}+${Y}" +repage \
  -background none -extent "${FULL}x${FULL}" -resize 1024x1024 \
  -define png:color-type=6 -strip "img/ghmeeting_mascot.png"
echo "   主體 ${W}x${H} → 1024²（留 $((PAD*100/FULL))% 安全邊）"

# ⑤ 各尺寸輸出
echo "④ 輸出 PWA icon..."
mk(){ convert "img/ghmeeting_mascot.png" -background none -resize "$2x$2" -define png:color-type=6 -strip "$1"; }
mk icons/icon-512.png 512
mk icons/icon-192.png 192
mk icons/icon-48.png 48

# maskable：Android 會裁到中間 80% 圓，主體縮到 60% 貼喺品牌綠底
convert -size 512x512 "xc:$GREEN" \
  \( "img/ghmeeting_mascot.png" -background none -resize 307x307 \) \
  -gravity center -composite -define png:color-type=6 -strip icons/icon-512-maskable.png

# apple-touch-icon：iOS 主畫面唔支援透明，實心底
convert -size 180x180 "xc:$GREEN" \
  \( "img/ghmeeting_mascot.png" -background none -resize 152x152 \) \
  -gravity center -composite -define png:color-type=2 -strip icons/apple-touch-icon.png

# favicon（瀏覽器分頁）：紙白底，綠圈包住吉祥物
convert -size 64x64 "xc:$PAPER" -fill "$GREEN" -draw "roundrectangle 2,2 61,61 14,14" \
  \( "img/ghmeeting_mascot.png" -background none -resize 52x52 \) \
  -gravity center -composite -define png:color-type=6 -strip icons/favicon-64.png

echo "✅ 完成："
ls -la img/ghmeeting_mascot.png icons/*.png | awk '{printf "   %-34s %s bytes\n",$9,$5}'
