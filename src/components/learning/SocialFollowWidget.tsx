import React from 'react';

export default function SocialFollowWidget() {
  return (
    <div className="bg-[#fafafa] border border-gray-100 rounded-3xl p-6 flex flex-col items-center">
      <h3 className="text-[#004e70] font-black text-lg mb-6">قم بمتابعتنا الآن</h3>
      
      <div className="flex items-center justify-center gap-4 w-full">
        {/* YouTube */}
        <a href="#" className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center hover:scale-110 transition-transform">
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.582 6.186a2.506 2.506 0 00-1.762-1.766C18.265 4 12 4 12 4s-6.264 0-7.82.42a2.505 2.505 0 00-1.762 1.766C2 7.74 2 12 2 12s0 4.26.418 5.814a2.506 2.506 0 001.762 1.766C5.735 20 12 20 12 20s6.265 0 7.82-.42a2.505 2.505 0 001.762-1.766C22 16.26 22 12 22 12s0-4.26-.418-5.814zM9.912 15.423V8.577L15.91 12l-5.998 3.423z"/>
          </svg>
        </a>
        
        {/* Telegram (Send icon equivalent) */}
        <a href="#" className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center hover:scale-110 transition-transform">
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.724 3.125a1.002 1.002 0 00-1.157-.156L2.348 11.23a.998.998 0 00-.012 1.768l5.247 2.724.877 5.864a1 1 0 001.696.47l3.666-3.666 4.908 3.633a.996.996 0 001.53-.787L22.68 4.122a1.002 1.002 0 00-.956-.997zM7.55 13.04l9.742-6.524-7.514 7.625.32 3.124-2.548-4.225z"/>
          </svg>
        </a>
        
        {/* Instagram */}
        <a href="#" className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center hover:scale-110 transition-transform relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <svg className="w-5 h-5 text-pink-600 relative z-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
        </a>
        
        {/* Facebook */}
        <a href="#" className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center hover:scale-110 transition-transform">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
          </svg>
        </a>
      </div>
    </div>
  );
}
