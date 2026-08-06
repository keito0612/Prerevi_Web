"use client";

import { useState, useMemo } from "react";

interface Town {
  town: string;
  postal: string;
}

interface TownSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (townName: string) => void;
  towns: Town[];
  selectedTown: string;
}

// ヘッダーコンポーネント
function ModalHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h2 className="text-lg font-bold text-gray-800">町を選択</h2>
      <button
        onClick={onClose}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

// 検索バーコンポーネント
function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="p-4 border-b">
      <div className="relative">
        <SearchIcon />
        <input
          type="text"
          placeholder="町名を検索..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          autoFocus
        />
      </div>
    </div>
  );
}

// 町ボタンコンポーネント
function TownButton({
  town,
  isSelected,
  onSelect,
}: {
  town: Town;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`p-3 text-left rounded-lg border transition ${
        isSelected
          ? "bg-green-500 text-white border-green-500"
          : "bg-white text-gray-700 border-gray-200 hover:border-green-500 hover:bg-green-50"
      }`}
    >
      <span className="block text-sm font-medium truncate">{town.town}</span>
    </button>
  );
}

// 町グリッドコンポーネント
function TownGrid({
  towns,
  selectedTown,
  onSelect,
}: {
  towns: Town[];
  selectedTown: string;
  onSelect: (townName: string) => void;
}) {
  if (towns.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {towns.map((town, index) => (
        <TownButton
          key={index}
          town={town}
          isSelected={selectedTown === town.town}
          onSelect={() => onSelect(town.town)}
        />
      ))}
    </div>
  );
}

// 空状態コンポーネント
function EmptyState({ isSearching = false }: { isSearching?: boolean }) {
  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      {isSearching ? "該当する町が見つかりませんでした" : "町情報がありません"}
    </div>
  );
}

// アイコンコンポーネント
function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

// メインコンポーネント
export default function TownSelectorModal({
  isOpen,
  onClose,
  onSelect,
  towns,
  selectedTown,
}: TownSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTowns = useMemo(() => {
    if (!searchQuery) return towns;
    return towns.filter((town) =>
      town.town.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [towns, searchQuery]);

  const handleSelect = (townName: string) => {
    onSelect(townName);
    setSearchQuery("");
    onClose();
  };

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl h-[70vh] sm:h-[60vh] flex flex-col animate-slide-up sm:animate-none">
        <ModalHeader onClose={handleClose} />
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {/* Town List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredTowns.length > 0 ? (
            <TownGrid
              towns={filteredTowns}
              selectedTown={selectedTown}
              onSelect={handleSelect}
            />
          ) : (
            <EmptyState isSearching={!!searchQuery} />
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
