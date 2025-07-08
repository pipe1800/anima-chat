import path from "path"
import react from "@vitejs/plugin-react-swc"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // This is the crucial part. It makes the environment variables 
      // available to the application code.
      'process.env.VITE_PAYPAL_CLIENT_ID': JSON.stringify(env.VITE_PAYPAL_CLIENT_ID),
      'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY),
    }
  }
})
