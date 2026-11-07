"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import Link from "next/link";
import { ApiResponse, ResultType, User } from "@/types";
import { UtilApi } from "@/Util/Util_api";
import { AuthService } from "@/service/authServise";
import ProfileImage from "./profile/ProfileImage";
import Modal from "./Modal";
import { useRouter } from "next/navigation";
import NotificationBell from "./NotificationBell";
import { FiArrowLeft } from "react-icons/fi";
import Image from "next/image";

interface NavBarProps {
  title: string;
  rightButton?: React.ReactNode;
  onBackClick?: () => void;
  onBack?: boolean;
}

const navigation = [
  { name: "ホーム", href: "/home" },
  { name: '設定', href: "/setting" },
  { name: "ログイン", href: "/login" },
  { name: "新規登録", href: "/sinUp" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function NavBar({ title, rightButton, onBackClick = () => { }, onBack = false }: NavBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [modalType, setModalType] = useState<ResultType>('Success');
  const [modalTitle, setModalTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isConfirmModal, setIsConfirmModalOpen] = useState(false);


  const getUser = async () => {
    const url = `${UtilApi.API_URL}/api/user`;
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthService.getSesstion()}`,
        },
      });
      const response: ApiResponse<{ user: User }> = await res.json();
      if (response.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  const logoutClick = async () => {
    setModalType('Normal');
    setModalTitle('ログアウト');
    setModalMessage('ログアウトしますか？');
    setIsModalOpen(true);
  }

  const onConfirm = async () => {
    setIsModalOpen(false);
    await logout();
  }
  const onClone = () => {
    router.refresh();
    window.location.reload();
  }

  const backClick = () => {
    onBackClick();
    router.back();
  }

  const logout = async () => {
    const url = `${UtilApi.API_URL}/api/logout`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AuthService.getSesstion()}`,
        },
      });
      const response: ApiResponse<{ message: string }> = await res.json();
      if (!response.success) {
        throw new Error(response.error.message);
      }

      setModalType('Success');
      setModalTitle('ログアウトが完了しました');
      setModalMessage('');
      setIsConfirmModalOpen(true);
      AuthService.deleteSesstion();
    } catch (error) {
      setModalType('Error');
      setModalTitle('ログアウトに失敗しました。');
      setModalMessage('もう一度お試しください。問題が続く場合は、ページを再読み込みしてください。');
      setIsConfirmModalOpen(true);
      console.error("Failed to logout:", error);
    }
  };

  useEffect(() => {
    setMounted(true);
    const session = AuthService.getSesstion();
    if (session) {
      setToken(session);
      getUser();
    }
  }, []);

  return (
    <>
      <Disclosure as="nav" className="fixed top-0 left-0 w-full z-50 lg:px-4 lg:pt-4">
        <div className="mx-auto max-w-7xl">
          {/* モバイル・タブレット：全幅の緑色ネイティブ風 / PC：フローティング白背景 */}
          <div className="bg-green-500 lg:bg-white/80 lg:backdrop-blur-xl lg:rounded-2xl lg:shadow-lg lg:border lg:border-white/20 px-4 lg:px-6">
            <div className="relative flex h-14 lg:h-16 items-center justify-center lg:justify-between">

              {/* 左側のロゴ・タイトル */}
              <div className="flex items-center justify-between w-full relative">
                {/* 左側：ロゴまたは戻るボタン */}
                <div className="flex items-center min-w-[40px]">
                  {/* PCのみロゴ表示 */}
                  <div className="hidden lg:flex items-center gap-2">
                    <Image
                      src="/images/prerevi_icon.png"
                      alt="プレリビ"
                      width={36}
                      height={36}
                      className="rounded-xl shadow-md"
                    />
                    <span className="text-gray-800 font-bold text-lg">プレリビ</span>
                  </div>

                  {/* モバイル・タブレットのみ戻るボタン表示 */}
                  {onBack && (
                    <button
                      className="lg:hidden p-2 rounded-xl hover:bg-green-600 transition-all duration-200 active:scale-95"
                      onClick={backClick}
                      aria-label="戻る"
                    >
                      <FiArrowLeft className="text-xl text-white" />
                    </button>
                  )}
                </div>

                {/* 中央：タイトル（モバイル・タブレット） */}
                <div className="absolute left-1/2 transform -translate-x-1/2 lg:hidden">
                  <span className="text-white text-lg font-bold whitespace-nowrap">
                    {title}
                  </span>
                </div>

                {/* 右側：ボタン（ない場合は空のスペース） */}
                <div className="flex items-center min-w-[40px]">
                  <div className="lg:hidden flex items-center">
                    <NotificationBell />
                  </div>
                  {rightButton}
                </div>

                {/* PC用ナビゲーション */}
                <div className="hidden lg:ml-8 lg:block">
                  <div className="flex space-x-2">
                    {navigation
                      .filter((item) => {
                        if (mounted && token) {
                          return item.name !== "ログイン" && item.name !== "新規登録";
                        }
                        return true;
                      })
                      .map((item) => {
                        const isCurrent = pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            aria-current={isCurrent ? "page" : undefined}
                            className={classNames(
                              isCurrent
                                ? "bg-green-500 text-white shadow-md"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                              "rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200"
                            )}
                          >
                            {item.name}
                          </Link>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* 右側のユーザー情報（PCのみ） */}
              <div className="hidden lg:flex absolute inset-y-0 right-0 items-center pr-2 lg:static lg:inset-auto lg:ml-6 lg:pr-0">
                <div className="flex flex-row items-center justify-center gap-2">
                  <NotificationBell />
                  <Menu as="div" className="relative ml-2">
                    <div>
                      <MenuButton className="relative flex rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 overflow-hidden transition-transform hover:scale-105">
                        <ProfileImage
                          imageUrl={user?.image_path ?? null}
                          sizes={40}
                        />
                      </MenuButton>
                    </div>
                    <MenuItems
                      className="absolute right-0 z-10 mt-3 w-52 origin-top-right rounded-2xl bg-white/95 backdrop-blur-xl py-2 shadow-xl ring-1 ring-black/5 focus:outline-none animate-scale-in"
                    >
                      <MenuItem>
                        <Link
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-xl mx-2 transition-colors"
                          href={"/profile"}
                        >
                          プロフィール
                        </Link>
                      </MenuItem>
                      {
                        token ?
                          <MenuItem as="button" onClick={logoutClick} className="block w-[calc(100%-16px)] text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-xl mx-2 transition-colors">
                            ログアウト
                          </MenuItem> : null
                      }
                    </MenuItems>
                  </Menu>
                  {user?.name && (
                    <p className="font-semibold text-gray-700 ml-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                      {user.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* モバイル・タブレット用メニュー */}
        <DisclosurePanel className="lg:hidden">
          <div className="bg-green-600 px-3 py-2 space-y-1">
            {navigation
              .filter((item) => {
                if (mounted && token) {
                  return item.name !== "ログイン" && item.name !== "新規登録";
                }
                return true;
              })
              .map((item) => {
                const isCurrent = pathname === item.href;
                return (
                  <DisclosureButton
                    key={item.name}
                    as={Link}
                    href={item.href}
                    aria-current={isCurrent ? "page" : undefined}
                    className={classNames(
                      isCurrent
                        ? "bg-green-700 text-white"
                        : "text-green-100 hover:bg-green-700 hover:text-white",
                      "block rounded-xl px-4 py-3 text-base font-medium transition-all duration-200"
                    )}
                  >
                    {item.name}
                  </DisclosureButton>
                );
              })}
          </div>
        </DisclosurePanel>
      </Disclosure>
      {/* ログアウト確認用モーダル */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        message={modalMessage}
        title={modalTitle}
        onConfirm={onConfirm}
      />
      {/* ログアウトの処理が終わった後のモーダル */}
      <Modal
        isOpen={isConfirmModal}
        onClose={onClone}
        type={modalType}
        message={modalMessage}
        title={modalTitle}
        onConfirm={onConfirm}
      />
    </>
  );
}

export default NavBar;
