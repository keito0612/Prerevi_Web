'use client';
import React, { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import SnackbarComponent from '../components/SnackBar';
import Loading2 from '../components/Loading2';
import Modal from '../components/Modal';
import { ApiResponse, ResultType } from '@/types';
import { UtilApi } from '@/Util/Util_api';
import Loading from '../components/Loading';

interface Inputs {
  password: string;
  password_confirmation: string;
}

function ResetPasswordContent() {
  const [loading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [modalType, setModalType] = useState<ResultType>('Success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email'); // URLから取得

  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>();

  const onSubmit = async (data: Inputs) => {
    if (!token || !email) {
      setErrorMessage('リンクが無効です。');
      setSnackbarOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${UtilApi.API_URL}/api/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, token, email }),
      });

      const response: ApiResponse<{ message: string }> = await res.json();

      if (!response.success) {
        setModalType('Error');
        setModalTitle('パスワードリセットが失敗しました。');
        setErrorMessage(response.error.message || 'サーバーに問題が発生しました。もう一度お試しください。');
        setSnackbarOpen(true);
      } else {
        setModalType('Success');
        setModalTitle('パスワードリセット完了しました。');
        setModalMessage('新しいパスワードでログインできます。');
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      setModalType('Error');
      setModalTitle('パスワードリセットが失敗しました。');
      setErrorMessage('サーバーに問題が発生しました。もう一度お試しください。');
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);
  const handleModalClose = () => {
    setIsModalOpen(false);
    if (modalType === 'Success') router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      {loading && <Loading2 loadingtext="パスワードを更新中..." />}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center text-green-600 mb-6">パスワードリセット</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* 新しいパスワード */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">新しいパスワード</label>
            <input
              id="password"
              type="password"
              placeholder='8文字以上で入力してください'
              {...register("password", {
                required: "パスワードは必須です",
                minLength: { value: 8, message: "8文字以上で入力してください" }
              })}
              className="mt-1 w-full px-4 py-2 text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            {errors.password && <p className="text-sm text-red-600 mt-1">※{errors.password.message}</p>}
          </div>

          {/* パスワード確認 */}
          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-semibold text-gray-700">パスワード確認</label>
            <input
              id="password_confirmation"
              placeholder='8文字以上で入力してください'
              type="password"
              {...register("password_confirmation", {
                required: "確認用パスワードは必須です"
              })}
              className="mt-1 w-full px-4 py-2 text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            {errors.password_confirmation && <p className="text-sm text-red-600 mt-1">※{errors.password_confirmation.message}</p>}
          </div>

          {/* 送信ボタン */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 shadow transition duration-300"
            >
              パスワードをリセット
            </button>
          </div>
        </form>
      </div>

      <SnackbarComponent message={errorMessage} open={snackbarOpen} onClose={handleCloseSnackbar} />
      <Modal isOpen={isModalOpen} onClose={handleModalClose} type={modalType} message={modalMessage} title={modalTitle} />
    </div>
  );
}


export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loading loadingtext="読み込み中..." />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

