"use client"

import Chart from "@/app/components/Chart";
import StarsRating from "@/app/components/StarsRating";
import TextErea from "@/app/components/TextErea";
import { ChartData, ResultType } from "@/types";
import { Path, useForm } from 'react-hook-form'
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UtilApi } from "@/Util/Util_api";
import { AuthService } from "@/service/authServise";
import Loading2 from "@/app/components/Loading2";
import Modal from "@/app/components/Modal";
import NavBar from "@/app/components/NavBar";
import ImageUploader from "@/app/components/ImageUploader";
import RatingSection from "@/app/components/RatingSection";
import NavigationBottomBar from "@/app/components/NavigationBottomBar";

interface RatingPostForm {
  safety: number
  childRearing: number
  cityPolicies: number
  publicTransportation: number
  livability: number
  photos: File[]
  goodComment: string
  badComment: string
  averageRating: number
}


const categoriesTitle = ["治安", "子育て", "制度", "交通機関", "住みやすさ"];
const categories = ["safety", "childRearing", "cityPolicies", "publicTransportation", "livability"];

export default function RatingPost() {
  const [ratings, setRatings] = useState<{ [key: string]: number }>(
    Object.fromEntries(categories.map((cat) => [cat, 0]))
  );
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const { register, handleSubmit, setError, formState: { errors } } = useForm<RatingPostForm>({
    defaultValues: {
      safety: 0,
      childRearing: 0,
      cityPolicies: 0,
      publicTransportation: 0,
      livability: 0,
      photos: [],
      goodComment: "",
      badComment: "",
      averageRating: 0,
    }
  });
  const [averageScore, setAverageScore] = useState<number>(0);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ResultType>('Success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const handleRatingChange = (category: string, value: number) => {
    setRatings((prev) => {
      const newRatings = { ...prev, [category]: value };
      const averageScore = Object.values(newRatings).reduce((sum, score) => sum + score, 0) / categories.length;
      setAverageScore(averageScore);
      return newRatings;
    });
  };

  const handleOnAddImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const newUrls = newFiles.map((file) => URL.createObjectURL(file));

      setFiles((prevFiles) => {
        if (prevFiles.length >= 4) return prevFiles; // すでに4枚なら追加しない
        const combined = [...prevFiles, ...newFiles];
        return combined.slice(0, 4); // 最大4枚まで
      });

      setPreviewUrls((prevUrls) => {
        if (prevUrls.length >= 4) return prevUrls;
        const combined = [...prevUrls, ...newUrls];
        return combined.slice(0, 4);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onClone = () => {
    setIsModalOpen(false);
    if (modalType === 'Success') {
      router.back();
    }
  }

  const validateFiles = (files: File[]): string | null => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    // 1. 形式チェック: 許可されていない形式が「一つでも含まれているか」
    const hasInvalidType = files.some(file => !ALLOWED_TYPES.includes(file.type));
    if (hasInvalidType) {
      return '画像の形式は jpeg, png, gif, webp のいずれかにしてください。';
    }

    // 2. サイズチェック: 制限を超えているものが「一つでも含まれているか」
    const hasExceededSize = files.some(file => file.size > MAX_FILE_SIZE);
    if (hasExceededSize) {
      return '各画像のサイズは 5MB 以内にしてください。';
    }

    return null;
  };

  async function onSubmit(dataSet: RatingPostForm) {
    const prefectureId = params.prefectureId;
    const cityId = params.cityId;
    const url: string = `${UtilApi.API_URL}/api/post/city_review/${prefectureId}/${cityId}`;
    const formData = new FormData();
    dataSet.photos = files;
    dataSet.averageRating = averageScore;
    formData.append('safety', dataSet.safety.toString());
    formData.append('childRearing', dataSet.childRearing.toString());
    formData.append('cityPolicies', dataSet.cityPolicies.toString());
    formData.append('publicTransportation', dataSet.publicTransportation.toString());
    formData.append('livability', dataSet.livability.toString());
    formData.append("goodComment", dataSet.goodComment.toString());
    formData.append("badComment", dataSet.badComment.toString());
    formData.append("averageRating", dataSet.averageRating.toString());
    files.forEach((file, index) => {
      formData.append('photos[' + index + ']', file)
    });
    setLoading(true);
    if (files.length > 0) {
      const validationError = validateFiles(files);
      if (validationError) {
        setError('photos', { message: validationError });
        setLoading(false);
        return;
      }
    }
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${AuthService.getSesstion()}`,
        },
        body: formData,
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setIsModalOpen(true);
        setModalType('Success');
        setModalTitle('レビューが投稿されました。');
        setModalMessage('');
      } else {
        const message = UtilApi.selectedErrorMessage(["safety", "childRearing", "cityPolicies", "publicTransportation", "livability", "goodComment", "badComment", "average_rating"], data["errors"])
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
  }

  const chartData: ChartData[] = categories.map((category, index) => (
    {
      name: categoriesTitle[index],
      score: ratings[category],
      fullMark: 0
    }));

  return (
    <div className="w-full h-full">
      <NavBar title="新規投稿" />
      {loading === true && (
        <Loading2 loadingtext={"読み込み中"} />
      )}
      <div className="flex flex-col items-center p-4 pt-24  mx-auto w-full max-w-4xl bg-gray-100">
        {/* 星評価 */}
        <div className='flex flex-col items-center w-full py-4  rounded-2xl bg-white mb-4'>
          <StarsRating rating={averageScore} />
        </div>

        {/* レーダーチャート */}
        <div className='w-full flex flex-col items-center p-2 pb-16 bg-white rounded-2xl'>
          <Chart title="評価" data={chartData} />
        </div>
        <form className="w-full" onSubmit={handleSubmit(onSubmit)} method="POST">
          {/* セレクトボタン */}
          <div className='w-full p-2 pb-2 my-4 bg-white rounded-2xl'>
            <RatingSection
              categories={categories as Path<RatingPostForm>[]}
              categoriesTitle={categoriesTitle}
              ratings={ratings}
              register={register}
              handleRatingChange={handleRatingChange}
            />
          </div>
          {/* 良い所欄 */}
          <div className='w-full p-2 pb-2 my-4 bg-white rounded-2xl'>
            <TextErea title="良い所" className="" placeholder="" errorMessage={errors.goodComment?.message} register={register("goodComment", {
              maxLength: { value: 300, message: "300文字以内で入力して下さい。" }
            })} />
          </div>
          {/* 悪いところ */}
          <div className='w-full p-2 pb-2 my-4 bg-white rounded-2xl'>
            <TextErea title="悪いところ" className="" placeholder="" errorMessage={errors.badComment?.message} register={register("badComment", {
              maxLength: { value: 300, message: "300文字以内で入力して下さい。" }
            })} />
          </div>
          {/* 画像アップロード */}
          <ImageUploader
            errorMessage={errors.photos?.message}
            previewUrls={previewUrls}
            handleRemoveImage={handleRemoveImage}
            handleOnAddImage={handleOnAddImage}
          />
          <div className="flex justify-center mt-6 pb-24">
            <button
              type="submit"
              className="w-full md:w-48 h-16 bg-green-500 text-white font-bold rounded-full shadow-md hover:bg-lime-600 transition duration-300"
            >
              投稿する
            </button>
          </div>
        </form >
        <NavigationBottomBar />
      </div >
      <Modal
        isOpen={isModalOpen}
        onClose={onClone}
        type={modalType}
        message={modalMessage}
        title={modalTitle} />
    </div>
  );
}
