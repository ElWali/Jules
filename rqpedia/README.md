# RQpedia

1) Install root deps
   npm install

2) Install frontend deps
   cd web
   npm install
   cd ..

3) Place your data file
   Put your output.json into ./data/output.json

4) Run dev (server + vite)
   npm run dev

   - Backend on http://localhost:4000
   - Frontend on http://localhost:5173 (Vite)

5) Build for production
   npm run build
   npm start     # serves built frontend via Express

6) Run Electron (dev)
   In one terminal: npm run dev
   In another: npm run electron