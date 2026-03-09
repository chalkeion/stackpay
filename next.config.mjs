/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@stacks/connect', '@stacks/network', '@stacks/auth', '@stacks/transactions'],
};

export default nextConfig;
