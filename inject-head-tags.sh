#!/bin/bash
set -e

HTML_FILES="index.html codex.html privacy.html quickref.html thank-you.html themes.html walkthrough.html"

HEAD_SNIPPET='<!-- Favicon and Touch Icons -->
<link rel="icon" type="image/x-icon" href="favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
<!-- Open Graph Meta Tags -->
<meta property="og:image" content="https://kypriatechnologies.org/kypria-crest-og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Kypria Technologies - Spartan Discipline Meets Digital Innovation">'

for file in $HTML_FILES; do
  if [ ! -f "$file" ]; then
    echo "Warning: $file not found, skipping..."
    continue
  fi
  
  if grep -q "kypria-crest-og.png" "$file"; then
    echo "$file already has head tags, skipping..."
    continue
  fi
  
  if grep -q "</head>" "$file"; then
    cp "$file" "$file.bak"
    awk -v snippet="$HEAD_SNIPPET" '
      /<\/head>/ {
        print snippet
      }
      { print }
    ' "$file.bak" > "$file"
    echo "Injected head tags into $file"
  else
    echo "Error: No </head> tag found in $file"
  fi
done

echo ""
echo "Head injection complete!"
echo "Backups saved as .html.bak"
echo "Review changes: git diff"