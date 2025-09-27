import React, { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      onFinish();
    }
  }, [progress, onFinish]);

  return (
    <div className="w-screen h-screen flex flex-col justify-between items-center bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400 text-brown-900 p-8">
      
      {/* Game Logo */}
      <div className="flex flex-col items-center mt-10">
        <a href="/" aria-label="Game Home">
          <img
            src="/game_logo.png"
            alt="Game Logo"
            className="w-40 h-40 mb-4 rounded-2xl shadow-lg"
          />
        </a>
        <h1 className="text-5xl font-extrabold">QR Quest 3.0</h1>
      </div>

      {/* Progress Bar */}
      <div className="w-3/4 bg-white/40 rounded-full h-4 overflow-hidden mt-8">
        <div
          className="h-4 bg-yellow-600 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Footer Logos */}
      <div className="w-full flex justify-center items-end gap-32 mb-8">
        
        {/* Sponsor */}
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium mb-2 text-center">Sponsored by</span>
          <a href="https://sponsor-website.com" target="_blank" rel="noopener noreferrer">
            <img
              src="/sponsor.png"
              alt="Sponsor Logo"
              className="h-28 w-auto object-contain"
            />
          </a>
        </div>

        {/* Developer */}
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium mb-2 text-center">Developed & Created by</span>
          <a href="https://developer-website.com" target="_blank" rel="noopener noreferrer">
            <img
              src="/voretx_visuals_tp.png"
              alt="Developer Logo"
              className="h-28 w-auto object-contain"
            />
          </a>
        </div>

      </div>
    </div>
  );
}
