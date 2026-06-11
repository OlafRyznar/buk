"use client";

import { useEffect, useState } from "react";

const IMAGES = [
  "/Gemini_Generated_Image_j8rkx9j8rkx9j8rk.png",
  "/Gemini_Generated_Image_jhj8eljhj8eljhj8.png",
  "/Gemini_Generated_Image_tez617tez617tez6.png",
  "/Gemini_Generated_Image_vr5ag3vr5ag3vr5a.png"
];

export default function BackgroundSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % IMAGES.length);
    }, 12000); // Transition every 12 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#0c0f12]">
      {IMAGES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-[3000ms] ease-in-out animate-bg-zoom"
          style={{
            backgroundImage: `url(${src})`,
            opacity: i === index ? 0.45 : 0,
          }}
        />
      ))}
      {/* Slightly lighter gradient overlay to keep it brighter and clean */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-[#080b0e]/65 to-[#06080b]" />
    </div>
  );
}
