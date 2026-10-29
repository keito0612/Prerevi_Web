"use client";

import { useState, useEffect, useRef } from "react";
import { MenuAction, User } from "@/types";
import Image from "next/image";
import MaterialSymbolsLightPersonOutlineRounded from "../icons/MaterialSymbolsLightPersonOutlineRounded";
import { usePathname } from "next/navigation";

interface ReviewHeaderProps {
  reviewId?: number;
  user: User | null;
  isAnonymous?: boolean;
  onMenuAction?: (action: MenuAction, id: number) => void | Promise<void>;
  onUserClick?: (userId: number) => void;
}

export default function ReviewHeader({
  reviewId,
  user,
  isAnonymous = false,
  onMenuAction,
  onUserClick,
}: ReviewHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isEditPage = pathname === "/profile";
  const [imageLoading, setImageLoading] = useState(true);
  const setLoading = (loading: boolean) => {
    setImageLoading(loading);
  };

  // 匿名ユーザーかどうかを判定
  const isAnonymousUser = isAnonymous || !user;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (open && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [open]);

  const handleSelect = (action: MenuAction) => {
    setOpen(false);
    onMenuAction?.(action, reviewId!);
  };




  return (
    <div
      className="flex items-center justify-between space-x-3"
      onClick={() => {
        if (!isAnonymousUser && user) {
          onUserClick?.(user.id);
        }
      }}
    >
      {/* 左側：ユーザーアイコンと名前 */}
      <div className="flex items-center space-x-3">
        {isAnonymousUser || user?.image_path == null ? (
          <MaterialSymbolsLightPersonOutlineRounded
            width={40}
            height={40}
            className={`rounded-full border-2 ${isAnonymousUser ? 'text-gray-400 border-gray-400' : 'text-green-500 border-green-500'}`}
          />
        ) : (
          <div className="relative w-[40px] h-[40px]">
            {imageLoading && (
              <div className="absolute inset-0 bg-black/40 animate-pulse rounded-full z-10" />
            )}
            <Image
              unoptimized
              src={user.image_path}
              alt="プロフィール写真"
              fill
              className="object-cover rounded-full"
              onLoad={() => setLoading(false)}
            />
          </div>
        )}
        <div>
          <div className={`font-semibold ${isAnonymousUser ? 'text-gray-500' : 'text-black'}`}>
            {isAnonymousUser ? '匿名' : user?.name}
          </div>
        </div>
      </div>

      {isEditPage && (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="メニューを開く"
            onClick={() => setOpen((prev) => !prev)}
            className={`p-1 rounded-full transition-colors focus:outline-none ${open ? "text-green-500" : "text-black"
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-32 rounded-lg bg-white shadow-lg ring-1 ring-black/5 z-10">
              <button
                onClick={() => handleSelect("edit")}
                className="w-full px-4 py-2 text-left text-sm text-black font-bold hover:bg-gray-50 rounded-t-lg"
              >
                編集
              </button>
              <button
                onClick={() => handleSelect("delete")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 font-bold rounded-b-lg text-red-600"
              >
                削除
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
