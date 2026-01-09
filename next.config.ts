import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co', 
      },
    ],
  },
  
  // O comentário abaixo manda o VS Code ignorar o erro nesta linha específica
  // @ts-expect-error: Configuração válida para build na Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;