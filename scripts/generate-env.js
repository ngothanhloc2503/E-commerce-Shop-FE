require('dotenv').config();
const fs = require('fs');
const path = require('path');

const env = {
  beUrl: process.env.BE_URL || 'http://localhost:8888',
  tinymceApiKey: process.env.TINYMCE_API_KEY || '',
};

const isProduction = process.env.NODE_ENV === 'production';

const content = `export const environment = {
  production: ${isProduction},
  apiUrl: '${env.beUrl}/api',
  baseUrl: '${env.beUrl}',
  tinymceApiKey: '${env.tinymceApiKey}'
};
`;

const fileName = isProduction ? 'environment.prod.ts' : 'environment.ts';
const targetPath = path.resolve(__dirname, '../src/environments', fileName);
fs.writeFileSync(targetPath, content, { encoding: 'utf8' });