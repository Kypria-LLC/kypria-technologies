#!/bin/bash
# inject-analytics.sh
# Idempotently injects GA4 (gtag.js) + Meta Pixel into all HTML pages.
# Run from repo root.
set -e

GA4_ID="G-ZR3YV47D0X"
META_PIXEL_ID="1024027273624000"

# Marker so the block is only injected once
MARKER="<!-- KYPRIA_ANALYTICS_v1 -->"

# Build the analytics block
read -r -d '' ANALYTICS_BLOCK <<EOF || true
${MARKER}
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA4_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GA4_ID}');
</script>
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1"/></noscript>
<!-- End Meta Pixel Code -->
EOF

# Files to instrument
FILES=$(find . -type f -name "*.html" -not -path "./node_modules/*" -not -path "./.git/*")

INJECTED=0
SKIPPED=0
for f in $FILES; do
  if grep -q "$MARKER" "$f"; then
    echo "  skip (already has marker): $f"
    SKIPPED=$((SKIPPED+1))
    continue
  fi
  if ! grep -q "</head>" "$f"; then
    echo "  WARN no </head>: $f"
    continue
  fi
  # Insert immediately after the first <meta charset...> line (very early in <head>)
  python3 - "$f" "$ANALYTICS_BLOCK" <<'PY'
import sys, re
path, block = sys.argv[1], sys.argv[2]
with open(path, 'r', encoding='utf-8') as fh:
    html = fh.read()
new = re.sub(
    r'(<meta\s+charset=["\'][^"\']+["\']\s*/?>)',
    lambda m: m.group(1) + "\n    " + block.replace("\n", "\n    "),
    html, count=1, flags=re.IGNORECASE
)
if new == html:
    # Fallback: just before </head>
    new = html.replace("</head>", block + "\n</head>", 1)
with open(path, 'w', encoding='utf-8') as fh:
    fh.write(new)
PY
  echo "  injected: $f"
  INJECTED=$((INJECTED+1))
done

echo ""
echo "Done. Injected: $INJECTED  Skipped: $SKIPPED"
echo "Verify with: grep -l '$MARKER' \$(find . -name '*.html')"
