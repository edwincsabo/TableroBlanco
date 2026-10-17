import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {cpSync} from 'node:fs';
export default defineConfig({base:'./',plugins:[react(),{name:'local-fonts',closeBundle(){cpSync('node_modules/@excalidraw/excalidraw/dist/prod/fonts','dist/fonts',{recursive:true});cpSync('node_modules/pdfjs-dist/wasm','dist/wasm',{recursive:true});cpSync('node_modules/pdfjs-dist/cmaps','dist/cmaps',{recursive:true});cpSync('node_modules/pdfjs-dist/standard_fonts','dist/standard_fonts',{recursive:true});}}],build:{chunkSizeWarningLimit:4000},optimizeDeps:{exclude:['@excalidraw/excalidraw']}});
