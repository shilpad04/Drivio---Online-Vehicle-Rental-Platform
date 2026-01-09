import { useState } from "react";
import ImageKit from "imagekit-javascript";

export default function ImageUpload({ images, setImages }) {
  const [uploading, setUploading] = useState(false);

  const imagekit = new ImageKit({
    publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT,
  });

  const getAuthParams = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/imagekit/auth`
    );
    if (!res.ok) {
      throw new Error("Failed to fetch ImageKit auth");
    }
    return res.json();
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);

    try {
      const auth = await getAuthParams();

      for (const file of files) {
        const res = await imagekit.upload({
          file,
          fileName: `${Date.now()}-${file.name}`,
          token: auth.token,
          signature: auth.signature,
          expire: auth.expire,
        });

        setImages((prev) => [...prev, res.url]);
      }
    } catch (err) {
      console.error("UPLOAD FAILED:", err);
      alert("Image upload failed. Check console.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (indexToRemove) => {
    setImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  return (
    <div className="space-y-4">
      {/* Upload Box */}
      <label
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition
          ${
            uploading
              ? "bg-gray-100 border-gray-300 cursor-not-allowed"
              : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
          }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />

        <svg
          className="h-10 w-10 text-gray-400 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-4-4l4 4m0 0l-4 4m4-4H3"
          />
        </svg>

        <p className="text-sm font-medium text-gray-700">
          {uploading
            ? "Uploading images..."
            : "Click to upload or select multiple images"}
        </p>

        <p className="text-xs text-gray-400 mt-1">
          JPG, PNG, WEBP supported
        </p>
      </label>

      {/* Uploading text */}
      {uploading && (
        <p className="text-sm text-blue-600 font-medium">
          Uploading… please wait
        </p>
      )}

      {/* Image Preview with Remove */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((url, index) => (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden border bg-white"
            >
              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 z-10 hidden group-hover:flex items-center justify-center h-7 w-7 rounded-full bg-black/70 text-white text-sm hover:bg-red-600"
                title="Remove image"
              >
                ✕
              </button>

              <img
                src={url}
                alt="vehicle"
                className="h-28 w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
