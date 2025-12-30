
import { getLandingPageHtml, getNotFoundPageHtml } from './shared/ui/templates.js';
import fs from 'fs';
import path from 'path';

const landingHtml = getLandingPageHtml();
const notFoundHtml = getNotFoundPageHtml('/test-path-for-404');

if (!fs.existsSync('verification')) {
  fs.mkdirSync('verification');
}

fs.writeFileSync('verification/landing.html', landingHtml);
fs.writeFileSync('verification/404.html', notFoundHtml);

console.log('HTML files generated in verification/');
