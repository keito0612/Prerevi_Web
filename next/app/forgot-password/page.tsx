'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import SnackbarComponent from '../components/SnackBar';
import Loading2 from '../components/Loading2';
import Modal from '../components/Modal';
import { ApiResponse, ResultType } from '@/types';
import { UtilApi } from '@/Util/Util_api';

interface Inputs {
  email: string;
}

export default function ForgotPassword() {
  const [loading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [modalType, setModalType] = useState<ResultType>('Success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, setError, formState: { errors } } = useForm<Inputs>();

  const onSubmit = async (data: Inputs) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${UtilApi.API_URL}/api/password/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const response: ApiResponse<{ message: string }> = await res.json();

      if (!response.success) {
        // バリデーションエラー（メールアドレスが登録されていない場合など）
        if (response.error.errors?.email) {
          setError('email', {
            type: 'server',
            message: response.error.errors.email[0],
          });
        } else {
          setModalType('Error');
          setModalTitle('メールの送信に失敗しました。');
          setModalMessage(response.error.message || 'サーバーに問題が発生しました。もう一度お試しください。');
          setIsModalOpen(true);
        }
      } else {
        setModalType('Success');
        setModalTitle('メールを送信しました');
        setModalMessage('入力したメールアドレス宛にパスワード再設定用のリンクを送信しました。メールをご確認ください。');
        setIsModalOpen(true);
      }
    } catch (err) {
      setModalType('Error');
      setModalTitle('メールの送信に失敗しました。');
      setModalMessage('サーバーに問題が発生しました。もう一度お試しください。');
      setIsModalOpen(true);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const onCloseModal = () => {
    setIsModalOpen(false);
    if (modalType === 'Success') router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      {loading && <Loading2 loadingtext="メール送信中..." />}
      <div className="w-full max-w-lg lg:max-w-xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-xl lg:text-3xl font-bold text-center text-green-600 mb-6">パスワード再設定メール送信</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* メールアドレス */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              placeholder="mail@example.com"
              {...register('email', {
                required: 'メールアドレスは必須です',
                pattern: {
                  value: /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
                  message: 'このメールアドレスは無効です。',
                },
              })}
              className="mt-1 w-full px-4 py-2 text-black border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">※{errors.email.message}</p>}
          </div>

          {/* 送信ボタン */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 shadow transition duration-300"
            >
              再設定メールを送信
            </button>
          </div>
        </form>
      </div>

      <SnackbarComponent
        message={errorMessage}
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        type={modalType}
        message={modalMessage}
        title={modalTitle}
      />
    </div>
  );
}
