import React, { useState } from 'react';
import { IconParkOutlineThumbsUp } from '../icons/IconParkOutlineThumbsUp';
import { ApiResponse, Review } from '@/types';
import { UtilApi } from '@/Util/Util_api';
import { AuthService } from '@/service/authServise';

interface ReviewLikeButtonProps {
  review: Review;
}

const ReviewLikeButton: React.FC<ReviewLikeButtonProps> = ({ review }) => {
  const [isLiked, setIsLiked] = useState<boolean>(review.is_liked);
  const [likesCount, setLikesCount] = useState<number>(review.likes_count);

  async function handleLikeClick() {
    let url: string = ''
    if (isLiked) {
      url = `${UtilApi.API_URL}/api/post/review/unlike/${review.id}`;
    } else {
      url = `${UtilApi.API_URL}/api/post/review/like/${review.id}`;
    }
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${AuthService.getSesstion()}`,
        },
      });
      const response: ApiResponse<{ message: string }> = await res.json();
      if (response.success) {
        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
      } else {
        throw new Error(response.error.message);
      }
    } catch (error) {
      throw new Error(`${error}`);
    }
  };

  return (
    <button
      onClick={handleLikeClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 ${isLiked
        ? 'bg-green-50 text-green-600'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
    >
      <IconParkOutlineThumbsUp
        className={`w-5 h-5 transition-transform duration-200 ${isLiked ? 'text-green-500 scale-110' : 'text-gray-400'}`}
      />
      <span>{likesCount}</span>
    </button>
  );
};

export default ReviewLikeButton;