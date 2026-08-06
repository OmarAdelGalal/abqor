import React from 'react';
import { FaFacebookF, FaInstagram, FaTelegramPlane, FaYoutube } from 'react-icons/fa';

export default function SocialFollowWidget() {
  return (
    <div className="bg-gray-50/80 border border-gray-100 rounded-3xl p-6 flex flex-col items-center shadow-sm">
      <h3 className="text-[#004e70] font-black text-base mb-4 text-center">قم بمتابعتنا الآن</h3>
      
      <div className="flex items-center justify-center gap-3 w-full">
        {/* Facebook */}
        <a 
          href="#" 
          className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
          aria-label="Facebook"
        >
          <FaFacebookF className="w-5 h-5" />
        </a>

        {/* Instagram */}
        <a 
          href="#" 
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
          aria-label="Instagram"
        >
          <FaInstagram className="w-5 h-5" />
        </a>

        {/* Telegram */}
        <a 
          href="#" 
          className="w-10 h-10 rounded-full bg-[#0088cc] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
          aria-label="Telegram"
        >
          <FaTelegramPlane className="w-5 h-5" />
        </a>
        
        {/* YouTube */}
        <a 
          href="#" 
          className="w-10 h-10 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
          aria-label="YouTube"
        >
          <FaYoutube className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}
