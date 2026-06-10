const fs = require('fs');
const path = require('path');

const mode = process.argv[2] || 'dev';
const isProd = mode === 'prod' || process.env.NODE_ENV === 'production';

const envConfig = {
  production: isProd,
  apiUrl: process.env.API_URL || 'http://localhost:8888/api',
  baseUrl: process.env.BASE_URL || 'http://localhost:8888',
  tinymceApiKey: process.env.TINYMCE_API_KEY || 'th474spuudpxmju6zc8oif37cw8k5609ouk8ytonewvqqiza',
};

const content = `export const environment = {
  production: ${envConfig.production},
  apiUrl: '${envConfig.apiUrl}',
  baseUrl: '${envConfig.baseUrl}',
  tinymceApiKey: '${envConfig.tinymceApiKey}'
};
`;

const targetPath = path.resolve(__dirname, '../src/environments/environment.ts');

const targetDir = path.dirname(targetPath);
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`📁 Created missing directory: ${targetDir}`);
}

fs.writeFileSync(targetPath, content, { encoding: 'utf8' });