import fs from 'fs';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist');
const vercelOutputDir = path.resolve(process.cwd(), '.vercel', 'output');
const vercelStaticDir = path.resolve(vercelOutputDir, 'static');

if (fs.existsSync(distDir)) {
  fs.mkdirSync(vercelStaticDir, { recursive: true });
  fs.cpSync(distDir, vercelStaticDir, { recursive: true });
  
  const config = {
    version: 3,
    routes: [
      { handle: "filesystem" },
      { src: "/(.*)", dest: "/index.html" }
    ]
  };
  fs.writeFileSync(path.resolve(vercelOutputDir, 'config.json'), JSON.stringify(config, null, 2));
  console.log('✓ Deployment output successfully prepared in .vercel/output/static and dist/');
}
