const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  reactStrictMode: false,
  env: {
    API_URL: process.env.API_URL,
  }
}

module.exports = nextConfig
