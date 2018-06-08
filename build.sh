mkdir -p dist
cd firefox && zip -r firefox.zip * && mv firefox.zip ../dist
cd -
cd chrome && zip -r chrome.zip * && mv chrome.zip ../dist
cd -
echo ""
echo ""
echo "  DID YOU BUMP THE manfest.json FILES ???"
echo ""
echo ""