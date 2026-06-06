/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: ['fundedbirr.com', 'localhost'],
  },
  // Uncomment for static export to cPanel public_html:
  // output: 'export',
};

export default nextConfig;
