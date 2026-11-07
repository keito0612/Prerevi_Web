'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiUserPlus, FiX } from 'react-icons/fi';
import ProfileImage from '@/app/components/profile/ProfileImage';
import NavBar from '@/app/components/NavBar';
import NavigationBottomBar from '@/app/components/NavigationBottomBar';
import { UtilApi } from '@/Util/Util_api';
import { AuthService } from '@/service/authServise';
import { ApiResponse, Notification, NotificationType, ResultType } from '@/types';
import Loading2 from '@/app/components/Loading2';
import Modal from '@/app/components/Modal';
import PageHeader from '@/app/components/PageHeader';

function NotificationDetail() {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const [isOpenModal, setIsOpanModal] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalMessage, setModalMessage] = useState<string>('');
  const [modalType, setModalType] = useState<ResultType>('Normal');
  const [modalOnConfirm, setModalOnConfirm] = useState<() => void | Promise<void>>();
  const [isOpenModal2, setIsOpanModal2] = useState<boolean>(false);
  const [modalTitle2, setModalTitle2] = useState<string>('');
  const [modalMessage2, setModalMessage2] = useState<string>('');
  const [modalType2, setModalType2] = useState<ResultType>('Normal');

  useEffect(() => {
    if (params.id) {
      getNotificationDetail(params.id as string);
    }
  }, [params.id]);

  const getNotificationDetail = async (id: string) => {
    try {
      const url = `${UtilApi.API_URL}/api/notifications/detail/${id}`;
      const token = AuthService.getSesstion();

      const res = await fetch(url, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const response: ApiResponse<{ notification: Notification }> = await res.json();
      if (response.success) {
        setNotification(response.data.notification);
      } else if (response.error.code === 'UNAUTHORIZED') {
        router.push("/unauthorized");
      } else {
        throw new Error(response.error.message);
      }
    } catch (e) {
      console.error("通知詳細取得エラー:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = () => {
    if (notification?.id) {
      router.push(`/profile/detail/${notification.liked_by_user?.id}`);
    }
  };

  const handleDeleteAllClick = () => {
    setModalType('Warning');
    setModalTitle('一括削除の確認');
    setModalMessage('通知を削除してもよろしいですか?\nこの操作は取り消せません。');
    setModalOnConfirm(() => deleteNotification);
    setIsOpanModal(true);
  };

  const deleteNotification = async () => {
    try {
      const url = `${UtilApi.API_URL}/api/notifications/delete/${params.id}`;
      const token = AuthService.getSesstion();

      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const response: ApiResponse<{ message: string }> = await res.json();
      if (response.success) {
        setModalType2('Success');
        setModalTitle2('通知を削除しました。');
        setModalMessage2('');
        setIsOpanModal2(true);
      } else {
        throw new Error(response.error.message);
      }
    } catch (e) {
      setModalType2('Error');
      setModalTitle2('通知を削除することができませんでした。');
      setModalMessage2('サーバーに何らかの問題が発生したので通知を削除できませんでした。\nもう一度お試しください。');
      setIsOpanModal2(true);
      console.error("通知削除エラー:", e);
    }
  };

  const onClone = () => {
    router.back();
  }

  return (
    <>
      {
        loading && <Loading2 loadingtext={'読み込み中'} />
      }
      <Modal
        isOpen={isOpenModal}
        onClose={() => setIsOpanModal(false)}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onConfirm={modalOnConfirm}
      />
      <Modal
        isOpen={isOpenModal2}
        onClose={onClone}
        title={modalTitle2}
        message={modalMessage2}
        type={modalType2}
      />
      <NavBar title="通知詳細" onBack={true} />
      <div className='relative flex w-full min-h-screen flex-col bg-gray-50 overflow-x-hidden'>
        <div className="px-4 sm:px-20 flex flex-1 justify-center py-5 pt-24 pb-24 sm:pb-0 md:pb-0 lg:pb-0 2xl:pb-0 xl:pb-0">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <PageHeader title={"通知詳細"} />

            {/* 通知カード */}
            <div className="bg-white rounded-2xl shadow-sm p-8 mt-2 border border-gray-200">
              {/* ヘッダー情報 */}
              <div className="flex items-center gap-4 mb-6">
                <div className='flex-shrink-0'>
                  <ProfileImage
                    imageUrl={notification?.liked_by_user?.image_path ?? null}
                    sizes={60}
                  />
                </div>
                <div className="">
                  <h2 className="text-xl font-bold text-black mb-1">
                    {notification?.title ?? ""}
                  </h2>
                </div>
              </div>

              {/* 通知本文 */}
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  {notification?.content ?? ""}
                </p>
              </div>

              {/* アクションボタン */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                {notification?.type === NotificationType.LIKE && (
                  <button
                    onClick={handleViewProfile}
                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition w-full sm:w-auto"
                  >
                    <FiUserPlus className="text-lg" />
                    <span className="text-sm sm:text-base">プロフィールを見る</span>
                  </button>
                )}
                <button
                  onClick={handleDeleteAllClick}
                  className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-700 text-white font-semibold px-4 py-2 sm:px-6 sm:py-3 rounded-lg border border-gray-300 transition w-full sm:w-auto"
                >
                  <FiX className="text-lg" />
                  <span className="text-sm sm:text-base">削除</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <NavigationBottomBar />
    </>
  );
}

export default NotificationDetail;