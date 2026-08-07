import React, { useState, useEffect, useCallback } from "react";
import { BsX, BsChevronLeft } from "react-icons/bs";

interface SheetModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showBackButton?: boolean;
  backButtonOnClick: () => void;
  headerContent?: React.ReactNode;
}

const SheetModal: React.FC<SheetModalProps> = ({
  title,
  isOpen,
  onClose,
  children,
  showBackButton = false,
  backButtonOnClick,
  headerContent
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startY, setStartY] = useState<number | null>(null);

  // アニメーション用の遅延表示
  useEffect(() => {
    if (isOpen) {
      // 少し遅延させてからアニメーション開始
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setDragOffset(0);
    }
  }, [isOpen]);

  // ドラッグ開始
  const handleDragStart = useCallback((clientY: number) => {
    setStartY(clientY);
    setIsDragging(true);
  }, []);

  // ドラッグ中
  const handleDragMove = useCallback((clientY: number) => {
    if (startY !== null && isDragging) {
      const offset = Math.max(0, clientY - startY);
      setDragOffset(offset);
    }
  }, [startY, isDragging]);

  // ドラッグ終了
  const handleDragEnd = useCallback(() => {
    if (dragOffset > 150) {
      onClose();
    }
    setDragOffset(0);
    setIsDragging(false);
    setStartY(null);
  }, [dragOffset, onClose]);

  // マウスイベント
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY);
  };

  // タッチイベント
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  // グローバルイベントリスナー
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleDragMove(e.clientY);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // ESCキーで閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen && !isVisible) return null;

  return (
    <>
      {/* Overlay with blur */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ease-out
          ${isVisible ? "bg-black/40 backdrop-blur-sm" : "bg-transparent backdrop-blur-none"}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className={`fixed z-50 bg-white shadow-2xl overflow-hidden
          transition-all ease-out
          ${isDragging ? "duration-0" : "duration-300"}

          /* Mobile: Bottom Sheet */
          inset-x-0 bottom-0 rounded-t-3xl
          h-[90vh]

          /* Desktop: Side Panel */
          md:inset-x-auto md:bottom-auto
          md:right-4 md:top-20 lg:top-24
          md:w-[480px] lg:w-[560px]
          md:h-[calc(100vh-6rem)] lg:h-[calc(100vh-7rem)]
          md:rounded-2xl

          ${isVisible ? "translate-y-0 md:translate-x-0 opacity-100" : "translate-y-full md:translate-y-0 md:translate-x-full opacity-0"}
        `}
        style={{
          transform: isVisible
            ? `translateY(${dragOffset}px)`
            : undefined,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Drag Handle - Mobile Only */}
        <div
          className="md:hidden flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleDragEnd}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full transition-colors hover:bg-gray-400" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div className="relative flex items-center justify-between h-14 px-4">
            {/* Back Button */}
            <div className="w-10">
              {showBackButton && (
                <button
                  onClick={backButtonOnClick}
                  className="flex items-center justify-center w-10 h-10 -ml-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200"
                  aria-label="戻る"
                >
                  <BsChevronLeft className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Title */}
            <h2
              id="modal-title"
              className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-gray-900 truncate max-w-[60%]"
            >
              {title}
            </h2>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 -mr-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200"
              aria-label="閉じる"
            >
              <BsX className="w-6 h-6" />
            </button>
          </div>

          {/* Header Content (Tabs, etc.) */}
          {headerContent && (
            <div className="border-t border-gray-50">
              {headerContent}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto overscroll-contain h-[calc(100%-3.5rem)]">
          {children}
        </div>
      </div>
    </>
  );
};

export default SheetModal;
