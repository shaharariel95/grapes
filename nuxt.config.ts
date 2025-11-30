import tailwindcss from "@tailwindcss/vite";

// @ts-ignore - process.env is available at build time
const authSecret = process.env.AUTH_SECRET || '';

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  modules: [
    // This module helps mock Cloudflare bindings (like D1) in development
    'nitro-cloudflare-dev',
  ],

  // Runtime configuration for environment variables
  runtimeConfig: {
    // Private keys (server-side only)
    authSecret: authSecret,

    // Public keys (exposed to client)
    public: {
      apiBase: ''
    }
  },

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

  // Security headers
  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      }
    }
  },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
});