# delete all node_modules
rm -rf -v package-lock.json
cd backend
rm -rf -v node_modules package-lock.json
npm install
cd ../binary-pay
rm -rf -v node_modules package-lock.json
npm install
