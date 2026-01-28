/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_NAME: '铮的AI Stock Picker',
  },
  images: {
    domains: [''],
  },
}

module.exports = nextConfig