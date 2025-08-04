"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Mountain,
  MapPin,
  Users,
  Calendar,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface IntroScreenProps {
  onComplete: () => void;
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const slides = [
    {
      title: "Selamat Datang",
      subtitle: "di Desa Tarubatang",
      description: "Destinasi wisata alam terbaik di kaki Gunung Merbabu",
      icon: Mountain,
      color: "from-green-600 to-green-800",
    },
    {
      title: "Jelajahi Keindahan",
      subtitle: "Alam Merbabu",
      description:
        "Air terjun, hutan pinus, dan pemandangan spektakuler menanti Anda",
      icon: MapPin,
      color: "from-blue-600 to-blue-800",
    },
    {
      title: "Bergabung dengan",
      subtitle: "Komunitas Desa",
      description:
        "Rasakan kehangatan masyarakat dan budaya lokal yang autentik",
      icon: Users,
      color: "from-purple-600 to-purple-800",
    },
    {
      title: "Event & Aktivitas",
      subtitle: "Sepanjang Tahun",
      description: "Festival, pendakian, dan kegiatan menarik lainnya",
      icon: Calendar,
      color: "from-orange-600 to-orange-800",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsAnimating(false);
            setTimeout(onComplete, 500);
          }, 1000);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 1250);

    return () => clearInterval(slideTimer);
  }, [slides.length]);

  const handleSkip = () => {
    setIsAnimating(false);
    setTimeout(onComplete, 300);
  };

  const currentSlideData = slides[currentSlide];
  const IconComponent = currentSlideData.icon;

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-500 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Background with gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.color} transition-all duration-1000`}
      >
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-24 h-24 bg-white rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-20 left-32 w-40 h-40 bg-white rounded-full animate-pulse delay-700"></div>
          <div className="absolute bottom-32 right-10 w-28 h-28 bg-white rounded-full animate-pulse delay-500"></div>
        </div>

        {/* Mountain silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/30 to-transparent">
          <svg
            viewBox="0 0 1200 300"
            className="absolute bottom-0 w-full h-full"
          >
            <path
              d="M0,300 L0,200 L200,100 L400,150 L600,80 L800,120 L1000,90 L1200,140 L1200,300 Z"
              fill="rgba(0,0,0,0.3)"
            />
            <path
              d="M0,300 L0,220 L150,130 L350,170 L550,110 L750,140 L950,120 L1200,160 L1200,300 Z"
              fill="rgba(0,0,0,0.2)"
            />
          </svg>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white px-4">
        {/* Logo/Icon */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto animate-bounce">
            <IconComponent className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-spin">
            <Sparkles className="w-4 h-4 text-yellow-800" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in">
            {currentSlideData.title}
          </h1>
          <h2 className="text-2xl md:text-3xl font-light mb-6 text-green-100 animate-fade-in delay-300">
            {currentSlideData.subtitle}
          </h2>
          <p className="text-lg md:text-xl text-white/90 animate-fade-in delay-500">
            {currentSlideData.description}
          </p>
        </div>

        {/* Slide indicators */}
        <div className="flex space-x-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? "bg-white scale-125" : "bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Memuat pengalaman...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/20" />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Button
            onClick={handleSkip}
            variant="outline"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            Lewati Intro
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>

          <div className="text-sm text-white/70 text-center">
            Atau tunggu {Math.ceil((100 - progress) / 20)} detik lagi
          </div>
        </div>

        {/* Village info */}
        <div className="absolute bottom-8 left-8 right-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Mountain className="h-5 w-5 text-green-300" />
              <span className="font-semibold">Desa Tarubatang</span>
            </div>
            <p className="text-sm text-white/80">
              Boyolali, Jawa Tengah • Ketinggian 1,200m • Kaki Gunung Merbabu
            </p>
          </div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
