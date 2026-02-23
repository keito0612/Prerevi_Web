"use client";

import { Photo } from "@/types";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import CustomImage from "../../CustomImage";
import MaterialSymbolsLightPersonOutlineRounded from "../../icons/MaterialSymbolsLightPersonOutlineRounded";
import { useRouter } from 'next/navigation';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectImageIndex: number | null;
  title: string;
  images: Photo[];
}

export default function ImageModal({
  isOpen,
  onClose,
  title,
  selectImageIndex,
  images,
}: ImageModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(selectImageIndex ?? 0);
  const router = useRouter();

  useEffect(() => {
    setSelectedImageIndex(selectImageIndex ?? 0);
  }, [selectImageIndex]);

  const onUserClick = (userId: number | undefined) => {
    if (userId !== undefined) {
      router.push(`profile/detail/${userId}`);
    }
    console.log(userId);
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[100]">
      {/* 背景 */}
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

      {/* モーダル本体 */}
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel
          className="w-full h-full lg:w-[90vw] lg:h-[90vh] bg-white rounded-none lg:rounded-lg shadow-xl overflow-hidden flex flex-col lg:flex-row"
        >
          {/* モバイル & iPad */}
          <div className="flex-1 block lg:hidden bg-black">
            <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-full h-full snap-center flex flex-col bg-black relative"
                >
                  <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
                    <div className="flex items-center space-x-2 text-white" onClick={() => onUserClick(img.review?.user?.id)}>
                      {img.review?.user?.image_path == null ? (
                        <MaterialSymbolsLightPersonOutlineRounded
                          width={40}
                          height={40}
                          className="rounded-full border-2 text-white border-white"
                        />
                      ) : (
                        <div className="relative w-[40px] h-[40px] rounded-full overflow-hidden">
                          <CustomImage
                            src={img.review.user.image_path}
                            alt="プロフィール写真"
                            fill
                            objectFit="cover"
                            className="object-cover rounded-full"
                          />
                        </div>
                      )}
                      <div className="flex flex-col text-sm">
                        <div className="font-bold">{img.review?.user?.name ?? "匿名ユーザー"}</div>
                        <div className="text-xs text-gray-400">{img.review?.posted_at_human ?? ""}</div>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-white hover:text-gray-300 transition-colors"
                      aria-label="画像を閉じる"
                    >
                      <XMarkIcon className="w-8 h-8" />
                    </button>
                  </div>

                  <div className="relative flex-1">
                    <CustomImage
                      src={img.photo_url!}
                      alt={`image-${i}`}
                      fill
                      objectFit="contain"
                      className="bg-black"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PC サムネイル */}
          <div className="hidden lg:flex w-[180px] flex-col border-r p-2 space-y-2 overflow-y-auto">
            {images.map((img, i) => (
              <div key={i} className="flex-shrink-0">
                <CustomImage
                  src={img.photo_url!}
                  alt={`thumb-${i}`}
                  width={180}
                  height={180}
                  objectFit="cover"
                  className={`object-cover cursor-pointer rounded border ${selectedImageIndex === i
                    ? "border-lime-500 border-2"
                    : "border-transparent"
                    }`}
                  onClick={() => setSelectedImageIndex(i)}
                />
              </div>
            ))}
          </div>

          {/* PC メイン画像 */}
          <div className="hidden lg:flex flex-1 flex-col bg-black">
            <div className="flex-col justify-center">
              <div className="flex justify-start bg-white items-center p-4 border-b-2">
                <span className="text-black font-bold">{title}</span>
              </div>
              <div className="flex-1 w-full flex-col bg-black items-center justify-center overflow-hidden relative">
                {/* ここに写真にあるヘッダーオーバーレイを追加 */}
                {images[selectedImageIndex] && (
                  <div className="top-0 left-0 right-0 z-10 flex items-center justify-between p-2 bg-gradient-to-b from-black/80 to-transparent">
                    <div className="flex items-center space-x-2 text-white" onClick={() => onUserClick(images[selectedImageIndex].review?.user?.id)}>
                      {images[selectedImageIndex].review?.user?.image_path == null ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <MaterialSymbolsLightPersonOutlineRounded
                            width={32}
                            height={32}
                            className="text-white"
                          />
                        </div>
                      ) : (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                          <CustomImage
                            src={images[selectedImageIndex].review.user.image_path}
                            alt="プロフィール写真"
                            fill
                            objectFit="cover"
                            className="object-cover rounded-full"
                          />
                        </div>
                      )}
                      <div className="flex flex-col text-sm">
                        <div className="font-bold">{images[selectedImageIndex].review?.user?.name ?? "匿名ユーザー"}</div>
                        <div className="text-xs text-gray-400">{images[selectedImageIndex].review?.posted_at_human ?? ""}</div>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-white hover:text-gray-300 transition-colors"
                      aria-label="画像を閉じる"
                    >
                      <XMarkIcon className="w-8 h-8" />
                    </button>
                  </div>
                )}

                {images[selectedImageIndex ?? 0] && (
                  <div className="relative w-3/4 h-auto aspect-square flex items-center justify-center mx-auto">
                    <CustomImage
                      src={images[selectedImageIndex ?? 0].photo_url!}
                      alt="メイン画像"
                      fill
                      objectFit="contain"
                      className="cursor-pointer rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}