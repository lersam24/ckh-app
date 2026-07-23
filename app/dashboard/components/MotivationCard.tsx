"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const slides = [
  {
    quote: "Kedisiplinan adalah jembatan antara tujuan dan pencapaian.",
    gradient: "linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)",
    image: "/motivation/1.png",
  },
  {
    quote: "Keberhasilan datang kepada mereka yang tekun berusaha.",
    gradient: "linear-gradient(135deg, #008939 0%, #004d20 100%)",
    image: "/motivation/2.png",
  },
  {
    quote: "Bekerja dengan hati akan menghasilkan karya yang luar biasa.",
    gradient: "linear-gradient(135deg, #b3541e 0%, #7a2e0a 100%)",
    image: "/motivation/3.png",
  },
  {
    quote: "Konsistensi kecil setiap hari menghasilkan dampak besar.",
    gradient: "linear-gradient(135deg, #6a1b9a 0%, #38006b 100%)",
    image: "/motivation/4.png",
  },
  {
    quote:
      "Profesionalisme adalah kemampuan melakukan yang terbaik saat dibutuhkan.",
    gradient: "linear-gradient(135deg, #c62828 0%, #8e0000 100%)",
    image: "/motivation/5.png",
  },
];

export default function MotivationCard() {
  const [current, setCurrent] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 8000);
    return () => clearInterval(timer);
  }, [next]);

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  const slide = slides[current];
  const useImage = !imageErrors.has(current);

  return (
    <div
      className="relative rounded-xl overflow-hidden min-h-[240px] flex items-end p-gutter-lg"
      style={{ background: slide.gradient }}
    >
      {useImage && (
        <Image
          key={current}
          src={slide.image}
          alt=""
          fill
          className="object-cover transition-opacity duration-700"
          onError={() => handleImageError(current)}
          priority={current === 0}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="relative z-10 text-white w-full">
        <span className="font-label-md text-label-md bg-white/20 backdrop-blur-md px-2 py-0.5 rounded mb-2 inline-block">
          Kata-kata Produktif
        </span>
        <p
          key={current}
          className="font-body-lg text-body-lg italic motivation-fade-in"
        >
          &ldquo;{slide.quote}&rdquo;
        </p>

        <div className="flex items-center gap-2 mt-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "bg-white w-5"
                  : "bg-white/40 hover:bg-white/60 w-2"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
