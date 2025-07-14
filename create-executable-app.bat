call npx esbuild --platform=node --bundle --outfile=./dist/main.js ./index.js
echo { "main": "./dist/main.js", "output": "./dist/sea-prep.blob" } > ./dist/sea-config.json 
node --experimental-sea-config ./dist/sea-config.json 
node -e "require('fs').copyFileSync(process.execPath, './dist/checkbox_terminal_payment_integrator_server.exe')" 
call npx postject ./dist/checkbox_terminal_payment_integrator_server.exe NODE_SEA_BLOB ./dist/sea-prep.blob ^
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2