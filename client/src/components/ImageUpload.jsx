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
      console.log("AUTH PARAMS:", auth);

      for (const file of files) {
        const res = await imagekit.upload({
          file,
          fileName: `${Date.now()}-${file.name}`,
          token: auth.token,
          signature: auth.signature,
          expire: auth.expire,
        });

        console.log("UPLOAD SUCCESS:", res);
        setImages((prev) => [...prev, res.url]);
      }
    } catch (err) {
      console.error("UPLOAD FAILED:", err);
      alert("Image upload failed. Check console.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Vehicle Images
      </label>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleUpload}
      />

      {uploading && (
        <p className="text-sm text-blue-600">Uploading…</p>
      )}

      <div className="grid grid-cols-3 gap-3">
        {images.map((url, i) => (
          <img
            key={i}
            src={url}
            alt="vehicle"
            className="h-24 w-full object-cover rounded border"
          />
        ))}
      </div>
    </div>
  );
}
