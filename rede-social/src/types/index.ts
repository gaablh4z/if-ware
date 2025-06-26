export interface User {
  id: string; // UUID no Supabase
  username: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  matricula?: string;
  tipo?: 'discente' | 'docente';
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string; // UUID no Supabase
  user_id: string;
  image_url?: string;
  caption?: string;
  hashtags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'comment' | 'follow';
  actor_id?: string;
  post_id?: string;
  comment_id?: string;
  read: boolean;
  created_at: string;
}

export interface Post {
    id: number;
    userId: number;
    content: string;
    timestamp: Date;
}