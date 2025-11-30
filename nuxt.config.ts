import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  modules: [
    // This module helps mock Cloudflare bindings (like D1) in development
    'nitro-cloudflare-dev',
  ],

  // Set the Nitro preset for Cloudflare Pages deployment
  nitro: {
    preset: 'cloudflare_pages',
    // Define the local D1 binding configuration for development
    cloudflare: {
      wrangler: {
        d1_databases: [
          {
            binding: 'DB', // This is the environment variable name (binding name)
            database_name: 'grapes_db', // The name of your local D1 DB
            database_id: 'local-db-id', // For local dev, this can be any string
          },
        ],
      },
    },
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
});