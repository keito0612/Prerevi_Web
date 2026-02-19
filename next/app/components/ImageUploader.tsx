'use client';

import Image from 'next/image';
import { MaterialSymbolsLightAdd2 } from './icons/MaterialSymbolsLightAdd2';

interface ImageUploaderProps {
  previewUrls: string[];
  errorMessage: string | undefined;
  handleRemoveImage: (index: number) => void;
  handleOnAddImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageUploader = ({
  previewUrls,
  errorMessage,
  handleRemoveImage,
  handleOnAddImage,
}: ImageUploaderProps) => {
  return (

    <div className="w-full border-2 border-dashed border-lime-400 rounded-xl p-6 bg-white">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {previewUrls.map((url, index) => (
          <div key={index} className="relative w-full aspect-square">
            <Image
              src={url}
              alt={`アップロード画像${index + 1}`}
              fill
              unoptimized
              className="object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full text-sm flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        ))}
        {previewUrls.length < 4 && (
          <label
            htmlFor="images"
            className="flex items-center justify-center w-full aspect-square bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer border-2 border-dashed border-gray-400 text-gray-500"
          >
            <MaterialSymbolsLightAdd2 className="w-8 h-8" />
          </label>
        )}
        <input
          id="images"
          type="file"
          multiple
          accept="image/*"
          onChange={handleOnAddImage}
          className="hidden"
        />
      </div>
      <p className="mt-2 text-sm text-gray-600">最大4枚まで追加できます</p>
      {errorMessage && (
        <span className="text-sm text-red-500 font-medium">※{errorMessage}</span>
      )}
    </div>
  );
};

export default ImageUploader;
