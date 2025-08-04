// 1. SOLUSI MENGGUNAKAN DYNAMIC IMPORT (Recommended)
// components/intro-screen-dynamic.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Komponen yang berisi elemen random
const FloatingElements = dynamic(() => import("./floating-elements"), {
  ssr: false, // Disable server-side rendering
  loading: () => <div>Loading...</div>,
});

const IntroScreen = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-900 via-green-800 to-green-700 z-50">
      {/* Static content that can be SSR'd */}
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-white relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Desa Tarubatang
          </h1>
          <p className="text-xl mb-8">
            Selamat datang di keindahan Gunung Merbabu
          </p>
          <button
            onClick={onComplete}
            className="bg-white text-green-800 px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors"
          >
            Mulai Jelajahi
          </button>
        </div>
      </div>

      {/* Dynamic content with random values */}
      <FloatingElements />
    </div>
  );
};

// components/floating-elements.tsx
const FloatingElements = () => {
  const dots = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${3 + Math.random() * 4}s`,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
          style={{
            left: dot.left,
            top: dot.top,
            animationDelay: dot.animationDelay,
            animationDuration: dot.animationDuration,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingElements;

// 2. SOLUSI MENGGUNAKAN SUPPRESSHYDRATIONWARNING
// page.tsx
export default function HomePage() {
  return (
    <html lang="id" suppressHydrationWarning>
      {/* Tambahkan suppressHydrationWarning ke elemen yang bermasalah */}
      <body>
        <div suppressHydrationWarning>
          {/* Konten yang bermasalah dengan hydration */}
        </div>
      </body>
    </html>
  );
}

// 3. SOLUSI MENGGUNAKAN CUSTOM HOOK
// hooks/useIsomorphicLayoutEffect.ts
import { useEffect, useLayoutEffect } from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;

// 4. SOLUSI MENGGUNAKAN SEEDED RANDOM
// utils/seededRandom.ts
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

// Gunakan seed yang konsisten untuk server dan client
const random = new SeededRandom(12345);

// components/intro-screen-seeded.tsx
const IntroScreenSeeded = ({ onComplete }: { onComplete: () => void }) => {
  // Gunakan seeded random untuk konsistensi
  const dots = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${random.next() * 100}%`,
    top: `${random.next() * 100}%`,
    animationDelay: `${random.next() * 5}s`,
    animationDuration: `${3 + random.next() * 4}s`,
  }));

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-900 via-green-800 to-green-700 z-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {dots.map((dot) => (
          <div
            key={dot.id}
            className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
            style={{
              left: dot.left,
              top: dot.top,
              animationDelay: dot.animationDelay,
              animationDuration: dot.animationDuration,
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-center h-full relative z-10">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Desa Tarubatang
          </h1>
          <p className="text-xl mb-8">
            Selamat datang di keindahan Gunung Merbabu
          </p>
          <button
            onClick={onComplete}
            className="bg-white text-green-800 px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors"
          >
            Mulai Jelajahi
          </button>
        </div>
      </div>
    </div>
  );
};
