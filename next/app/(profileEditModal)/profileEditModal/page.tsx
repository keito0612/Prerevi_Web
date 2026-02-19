"use client";


import Loading2 from "@/app/components/Loading2";
import Modal from "@/app/components/Modal";
import ProfileEditImageButton from "@/app/components/profile/ProfileEditImageButton";
import TextErea from "@/app/components/TextErea";
import TextField from "@/app/components/TextField";
import { AuthService } from "@/service/authServise";
import { Profile, ResultType } from "@/types";
import { UtilApi } from "@/Util/Util_api";
import { Close } from "@mui/icons-material";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";


interface ProfileEditModalForm {
  name: string;
  comment: string;
  profileImage: string | null;
}

const ProfileEditModal: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProfileEditModalForm>();
  const [loading, setLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [modalType, setModalType] = useState<ResultType>('Success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const handleClose = () => {
    router.back();
  };


  const handleChangeImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setPreviewUrl(URL.createObjectURL(event.target.files[0]));
    }
  };

  async function getProfile() {
    try {
      const url: string = `${UtilApi.API_URL}/api/profile`;
      const token = AuthService.getSesstion();
      const res = await fetch(url, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      if (res.ok) {
        const data = await res.json();
        const profileData: Profile = data['profile'] as Profile;
        setPreviewUrl(profileData.image_path);
        reset({
          name: profileData.name,
          comment: profileData.comment ?? '',
          profileImage: profileData.image_path ? profileData.image_path : null
        });
      } else if (res.status === 401) {
        redirect('/home');
      } else {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
    } catch (e) {
      console.error("プロフィール取得エラー:", e);
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await getProfile();
      setLoading(false);
    })()
  }, []);

  const onClone = () => {
    setIsModalOpen(false);
    if (modalType === 'Success') {
      router.back();
    }
  }

  const onSubmit: SubmitHandler<ProfileEditModalForm> = async (data) => {
    const formData = new FormData();
    const url: string = `${UtilApi.API_URL}/api/profile/update`;
    formData.append('name', data.name);
    formData.append('comment', data.comment ?? '');
    if (file !== null) {
      formData.append('profileImage', file);
    }
    setLoading(true);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AuthService.getSesstion()}`,
        },
        body: formData,
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setIsModalOpen(true);
        setModalType('Success');
        setModalTitle('プロフィールを編集しました。');
        setModalMessage('');
      } else {
        const message = UtilApi.selectedErrorMessage(["name", "comment", "profileImage"], data["errors"])
        setIsModalOpen(true);
        setModalType('Error');
        setModalTitle('エラーが発生しました。');
        setModalMessage(message);
      }
    } catch (error) {
      setIsModalOpen(true);
      setModalType('Error');
      setModalTitle('エラーが発生しました。');
      setModalMessage('原因不明のエラーが発生した事により、投稿できませんでした。');
      setLoading(false);
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-black/50 flex items-center justify-center z-50 p-4">
      {loading === true && (
        <Loading2 loadingtext={"読み込み中"} />
      )}
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          onClick={handleClose}
          aria-label="Close Modal"
        >
          <Close style={{ fontSize: 30, color: 'black' }} className="h-6 w-6" />
        </button>
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-gray-800">プロフィール編集</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="">
          <div className="flex items-center justify-center space-x-3">
            <ProfileEditImageButton previewUrl={previewUrl} onChange={handleChangeImage} register={register("profileImage")} errorMessage={errors.profileImage?.message} />
          </div>
          <TextField
            title="名前" // TextFieldに表示するタイトル
            register={register("name", { required: "名前は必須です。", maxLength: { value: 100, message: "100文字以内で入力してください。" } })}
            errorMessage={errors.name?.message}
            placeholder="名前を入力してください"
          />
          <TextErea
            className="pb-8"
            title="自己紹介"
            register={register("comment", { maxLength: { value: 300, message: "300文字以内で入力してください。" } })} // コメントは任意項目のため、バリデーションは省略
            errorMessage={errors.comment?.message} // 必要であればコメントにもバリデーションとエラーメッセージ
            placeholder="自己紹介を入力してください"
          />
          <button type="submit" disabled={isSubmitting} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
            {isSubmitting ? '編集中...' : '編集'}
          </button>
        </form>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={onClone}
        type={modalType}
        message={modalMessage}
        title={modalTitle} />
    </div>
  );
};

export default ProfileEditModal;