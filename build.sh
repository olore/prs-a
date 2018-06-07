echo "DON'T FORGET TO BUMP THE manfest.json FILES"
cd firefox && zip -r prs-a.zip *
cd -
cd chrome && zip -r prs-a.zip *
cd -