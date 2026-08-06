"use client";
import { Review } from "@/types";

interface ReviewLocationProps {
  review: Review;
}

export default function ReviewLocation({
  review
}: ReviewLocationProps) {

  return (
    <div className="flex items-center justify-start font-bold text-black">
      <p>{review.prefecture.name}{review.city.name}{review.town_name ?? ''}</p>
    </div>
  );
}
