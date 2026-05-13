"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images.length) {
    return (
      <div className="h-72 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 text-6xl">
        🏠
      </div>
    );
  }

  function prev() { setActive((a) => (a - 1 + images.length) % images.length); }
  function next() { setActive((a) => (a + 1) % images.length); }

  return (
    <>
      <div className="relative h-72 md:h-96 rounded-xl overflow-hidden cursor-pointer" onClick={() => setLightbox(true)}>
        <Image src={images[active]} alt={`${title} - ${active + 1}`} fill className="object-cover" />
        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full">
              <ChevronLeft size={20} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full">
              <ChevronRight size={20} />
            </button>
            <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {active + 1}/{images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActive(i)} className={`relative h-16 w-24 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${i === active ? "border-teal-600" : "border-transparent"}`}>
              <Image src={img} alt={`${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightbox(false)}><X size={28} /></button>
          <button className="absolute left-4 text-white" onClick={(e) => { e.stopPropagation(); prev(); }}><ChevronLeft size={36} /></button>
          <div className="relative w-full max-w-3xl h-[70vh]" onClick={(e) => e.stopPropagation()}>
            <Image src={images[active]} alt={title} fill className="object-contain" />
          </div>
          <button className="absolute right-4 text-white" onClick={(e) => { e.stopPropagation(); next(); }}><ChevronRight size={36} /></button>
        </div>
      )}
    </>
  );
}
