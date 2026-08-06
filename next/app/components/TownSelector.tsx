"use client";

import { useState, useEffect } from "react";
import { UtilApi } from "@/Util/Util_api";
import TownSelectorModal from "./TownSelectorModal";

interface Town {
  town: string;
  postal: string;
}

interface TownSelectorProps {
  cityId: string | number;
  selectedTown: string;
  onSelect: (townName: string) => void;
  error?: string;
  onError?: (error: string) => void;
}

// ラベルコンポーネント（TextEreaと同じスタイル）
function Label({ text }: { text: string }) {
  return (
    <div className="w-16 h-8 mb-2 sm:w-20 sm:h-10 md:w-24 md:h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm md:text-base shadow-sm">
      {text}
    </div>
  );
}

// ローディング状態
function LoadingState() {
  return <div className="text-gray-500">町を読み込み中...</div>;
}

// 空状態
function EmptyState() {
  return <div className="text-gray-500">町情報を取得できませんでした</div>;
}

// 選択ボタン
function SelectButton({
  selectedTown,
  hasError,
  onClick,
}: {
  selectedTown: string;
  hasError: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-3 text-left border rounded-xl flex items-center justify-between transition-all duration-200 ${
        hasError
          ? "border-red-400 bg-red-50"
          : "border-gray-200 bg-gray-50 hover:border-gray-300"
      } ${selectedTown ? "text-gray-900" : "text-gray-500"}`}
    >
      <span>{selectedTown || "町を選択してください"}</span>
      <ChevronDownIcon />
    </button>
  );
}

// エラーメッセージ
function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="pt-1.5 min-h-[1.5rem]">
      <span className="text-sm text-red-500 font-medium">※{message}</span>
    </div>
  );
}

// アイコン
function ChevronDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

// メインコンポーネント
export default function TownSelector({
  cityId,
  selectedTown,
  onSelect,
  error,
  onError,
}: TownSelectorProps) {
  const [towns, setTowns] = useState<Town[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchTowns = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${UtilApi.API_URL}/api/city/${cityId}/towns/`);
        const data = await res.json();

        if (res.ok && data.towns) {
          setTowns(data.towns);
        }
      } catch (err) {
        console.error("Failed to fetch towns:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (cityId) {
      fetchTowns();
    }
  }, [cityId]);

  const handleSelect = (townName: string) => {
    onSelect(townName);
    if (onError) onError("");
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (towns.length === 0) {
      return <EmptyState />;
    }

    return (
      <SelectButton
        selectedTown={selectedTown}
        hasError={!!error}
        onClick={() => setIsModalOpen(true)}
      />
    );
  };

  return (
    <div className="w-full p-2 pb-2 my-4 bg-white rounded-2xl">
      <div className="flex flex-col justify-start">
        <Label text="町名" />
        {renderContent()}
        {error && <ErrorMessage message={error} />}
      </div>

      <TownSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelect}
        towns={towns}
        selectedTown={selectedTown}
      />
    </div>
  );
}
