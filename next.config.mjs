/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/api/tasks',
          destination: 'http://localhost:8000/tasks',
        },
        {
          source: '/api/tasks/:path*',
          destination: 'http://localhost:8000/tasks/:path*',
        },
      ]
    },
  };
  
  export default nextConfig;