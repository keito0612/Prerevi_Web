export type ResultType = "Normal" | "Success" | "Error" | "Warning";
export type MenuAction = "edit" | "delete";
export type RatingProperty = 'safety' | 'public_transportation' | 'child_rearing' | 'city_policies' | 'livability' | 'average_rating';
export const NotificationType = {
  POST: "post",
  LIKE: "like",
  NOTICE: "notice",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export interface Profile {
  id: number;
  name: string;
  email: string;
  image_path: string | null;
  comment: string;
  liked_reviews_count: number;
  reviews_count: number;
  reviews: Review[];
  liked_reviews: Review[];
  likes: unknown[];
}

export interface UserSetting {
  email_notification: boolean;
}

export interface ChartData {
  name: string;
  score: number;
  fullMark: number;
}

export interface City {
  id: number;
  name: string;
  prefecture_id: number;
}


export interface User {
  id: number;
  name: string;
  image_path: string | null;
  commment: string;
}

export interface Prefecture {
  id: number;
  name: string;
};

export interface Rating {
  id: number;
  review_id: number;
  safety: number;
  public_transportation: number;
  child_rearing: number;
  city_policies: number;
  livability: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
};

export interface Photo {
  id: number;
  review_id: number;
  review: Review | null;
  photo_url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export interface Review {
  id: number;
  user_id: number | null;
  city_id: number;
  prefecture_id: number;
  town_name: string | null;
  good_comment: string;
  bad_comment: string;
  created_at: string;
  updated_at: string;
  city: City;
  posted_at_human: string;
  prefecture: Prefecture;
  rating: Rating;
  photos: Photo[];
  likes: unknown[];
  user: User | null;
  is_liked: boolean;
  likes_count: number;
  is_anonymous: boolean;
};

export interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  time: string;
  liked_by_user?: User | null;
}

