'use client';
import NavBar from '../components/NavBar';
import NavigationBottomBar from '../components/NavigationBottomBar';
import { UtilApi } from '@/Util/Util_api';
import { AuthService } from '@/service/authServise';
import { useRouter } from 'next/navigation';
import NotificationList from '../components/notification/NotificationList';
import { ApiResponse, Notification, ResultType } from '@/types';
import { useEffect, useState } from 'react';
import Loading2 from '../components/Loading2';
import Modal from '../components/Modal';
import Button from '../components/Button';
import ReactPaginate from 'react-paginate';

function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [perPage, setPerPage] = useState<number>(15);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenModal, setIsOpanModal] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalMessage, setModalMessage] = useState<string>('');
  const [modalType, setModalType] = useState<ResultType>('Normal');
  const [modalOnConfirm, setModalOnConfirm] = useState<() => void | Promise<void>>();

  useEffect(() => {
    getNotifications(1);
  }, []);

  const getNotifications = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const url = `${UtilApi.API_URL}/api/notifications?page=${page}`;
      const token = AuthService.getSesstion();
      const res = await fetch(url, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const response: ApiResponse<{
        notifications: Notification[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
      }> = await res.json();

      if (response.success) {
        setNotifications(response.data.notifications);
        setCurrentPage(response.data.current_page);
        setLastPage(response.data.last_page);
        setTotal(response.data.total);
        setPerPage(response.data.per_page);
      } else if (response.error.code === 'UNAUTHORIZED') {
        router.push("/unauthorized");
      } else {
        throw new Error(response.error.message);
      }
    } catch (e) {
      setModalType('Error');
      setModalTitle('エラーが発生しました。');
      setModalMessage('原因不明のエラーが発生した事により、データを取得することができませんでした。\n お手数ですが、もう一度お試しください。');
      setIsOpanModal(true);
      console.error("通知取得エラー:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageClick = (event: { selected: number }) => {
    const newPage = event.selected + 1; // react-paginateは0始まりなので+1
    getNotifications(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteAllNotifications = async () => {
    setIsLoading(true);

    try {
      const url = `${UtilApi.API_URL}/api/notifications/all_delete`;
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
        setNotifications([]);
        setCurrentPage(1);
        setLastPage(1);
        setTotal(0);
        setModalType('Success');
        setModalTitle('削除完了');
        setModalMessage('すべての通知を削除しました。');
        setIsOpanModal(true);
      } else if (response.error.code === 'UNAUTHORIZED') {
        router.push("/unauthorized");
      } else {
        throw new Error(response.error.message);
      }
    } catch (e) {
      console.error("通知一括削除エラー:", e);

      setModalType('Error');
      setModalTitle('エラーが発生しました');
      setModalMessage('通知の削除に失敗しました。\nお手数ですが、もう一度お試しください。');
      setIsOpanModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAllClick = () => {
    if (notifications.length === 0) {
      setModalType('Warning');
      setModalTitle('通知がありません');
      setModalMessage('削除する通知がありません。');
      setIsOpanModal(true);
      return;
    }
    setModalType('Warning');
    setModalTitle('一括削除の確認');
    setModalMessage(`すべての通知(${total}件)を削除してもよろしいですか?\nこの操作は取り消せません。`);
    setModalOnConfirm(() => deleteAllNotifications);
    setIsOpanModal(true);
  };

  return (
    <>
      <style jsx global>{`
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          list-style: none;
          padding: 0;
          margin: 2rem 0;
          gap: 0.5rem;
        }
        
        .pagination li {
          display: inline-block;
        }
        
        .pagination li a {
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          background-color: #f3f4f6;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
          user-select: none;
        }
        
        .pagination li a:hover {
          background-color: #e5e7eb;
        }
        
        .pagination li.selected a {
          background-color: #00CC41FF;
          color: white;
          font-weight: bold;
        }
        
        .pagination li.disabled a {
          background-color: #f3f4f6;
          color: #d1d5db;
          cursor: not-allowed;
        }
        
        .pagination li.disabled a:hover {
          background-color: #f3f4f6;
        }
        
        .pagination li.previous a,
        .pagination li.next a {
          background-color: #00CC41FF;
          color: white;
        }
        
        .pagination li.previous a:hover,
        .pagination li.next a:hover {
          background-color: #00CC41FF;
        }
        
        .pagination li.previous.disabled a,
        .pagination li.next.disabled a {
          background-color: #f3f4f6;
          color: #d1d5db;
        }
        
        .pagination li.break a {
          background-color: transparent;
          cursor: default;
        }
        
        .pagination li.break a:hover {
          background-color: transparent;
        }
      `}</style>

      <Modal
        isOpen={isOpenModal}
        onClose={() => setIsOpanModal(false)}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onConfirm={modalOnConfirm}
      />
      {isLoading && <Loading2 loadingtext={'読み込み中'} />}

      <NavBar
        title="通知一覧"
        rightButton={
          <Button
            className='text-red-500 font-semibold py-1 px-3 sm:hidden'
            onClick={handleDeleteAllClick}
          >
            <span className='text-sm'>一括削除</span>
          </Button>
        }
      />

      <div className='relative flex w-full min-h-screen flex-col bg-white overflow-x-hidden'>
        <div className="px-4 sm:px-20 flex flex-1 justify-center py-5 pt-16 pb-24 sm:pb-0 md:pb-0 lg:pb-0 2xl:pb-0 xl:pb-0">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className='flex flex-col w-full pt-4'>
              <div className='sm:flex flex-row justify-between items-start hidden py-3'>
                <h1 className='text-3xl text-black font-bold'>
                  通知 {total > 0 && <span className='text-lg text-gray-600'>({total}件)</span>}
                </h1>
                <Button
                  className='bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all'
                  onClick={handleDeleteAllClick}
                >
                  <span className='text-sm'>一括削除</span>
                </Button>
              </div>

              <NotificationList notifications={notifications} />

              {total > 0 && (
                <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                  <div>
                    {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, total)} 件目 / 全 {total} 件
                  </div>
                  <div>
                    1ページあたり {perPage} 件表示
                  </div>
                </div>
              )}

              {lastPage > 1 && (
                <ReactPaginate
                  breakLabel="..."
                  nextLabel="次へ ›"
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={3}
                  marginPagesDisplayed={2}
                  pageCount={lastPage}
                  previousLabel="‹ 前へ"
                  renderOnZeroPageCount={null}
                  containerClassName="pagination"
                  activeClassName="selected"
                  disabledClassName="disabled"
                  forcePage={currentPage - 1}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <NavigationBottomBar />
    </>
  );
}

export default Notifications;