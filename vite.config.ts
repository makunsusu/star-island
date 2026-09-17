import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
export default defineConfig({ plugins:[vue()], server:{port:Number(process.env.STAR_WEB_PORT||5173),strictPort:true,proxy:{'/api':'http://127.0.0.1:'+(process.env.STAR_API_PORT||3100)}}, build:{chunkSizeWarningLimit:1300} });
