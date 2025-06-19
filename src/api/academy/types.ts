export interface Thumbnail {
  low_res_url: string;
  high_res_url: string;
}

export interface Course {
  name: string;
  description: string;
  thumbnail: Thumbnail;
  video_url: string;
  duration: string;
  created_at: string;
  content?: string;
}

export interface Category {
  category: string;
  category_desription: string;
  courses: Course[];
}

export type Catalog = Category[];
