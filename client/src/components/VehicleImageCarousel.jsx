import { useState } from "react";

export default function VehicleImageCarousel({ images }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hasMultipleImages = images.length > 1;

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % images.length);

  const prevImage = () =>
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );

  return (
    <div className="relative bg-gray-100 rounded-xl h-80 overflow-hidden">
      {hasMultipleImages && (
        <>
          <img
            src={images[currentImageIndex]}
            className="w-full h-full object-cover"
            alt=""
          />
          <button
            onClick={prevImage}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full"
          >
            ‹
          </button>
          <button
            onClick={nextImage}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
