#! /usr/bin/env node

import { copyFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

const source = join(projectRoot, "node_modules/pdfjs-dist/build/pdf.worker.min.mjs");
const destination = join(projectRoot, "public/pdf.worker.min.mjs");

try {
  // Ensure public directory exists
  mkdirSync(join(projectRoot, "public"), { recursive: true });
  
  // Copy the PDF.js worker file
  copyFileSync(source, destination);
  
  console.log("✓ PDF.js worker copied to public directory");
} catch (error) {
  console.error(`Error copying PDF.js worker from ${source} to ${destination}:`, error.message);
  process.exit(1);
}
