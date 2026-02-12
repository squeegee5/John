#!/bin/bash
# Build self-contained HTML for Shopify Pages

CSS=$(cat css/styles.css)
CONFIG_JS=$(cat js/config.js)
CALENDAR_JS=$(cat js/calendar.js)
APP_JS=$(cat js/app.js)

# Extract the body content from index.html (between <body> and </body>), 
# but replace the external references with inline versions
BODY=$(sed -n '/<body>/,/<\/body>/p' index.html | sed '1d;$d' | \
  sed '/<link rel="stylesheet"/d' | \
  sed '/<script src=/d')

cat > shopify-page-body.html << HTMLEOF
<style>
${CSS}
</style>

${BODY}

<script>
${CONFIG_JS}
</script>
<script>
${CALENDAR_JS}
</script>
<script>
${APP_JS}
</script>
HTMLEOF

echo "Built shopify-page-body.html ($(wc -c < shopify-page-body.html) bytes)"
