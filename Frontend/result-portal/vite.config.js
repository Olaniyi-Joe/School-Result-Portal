import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
  ], 
  base: '/static/',
 // server: {
   // host: true, // Allow access from network
   // port: 5173, // or any port you prefer
 // },
})

