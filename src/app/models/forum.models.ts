// מודלי הנתונים של הפורום המשפחתי

export interface Forum {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  icon: string;
}

export interface Category {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export interface Thread {
  id: string;
  forumId: string;
  title: string;
  author: string;
  createdAt: number;
  pinned?: boolean;
  locked?: boolean;
  views?: number;
}

export interface Post {
  id: string;
  threadId: string;
  author: string;
  body: string;
  createdAt: number;
  image?: string; // תמונה מצורפת (data URL, נשמרת ב-localStorage)
}

// מצב מלא של הפורום כפי שנשמר ב-localStorage
export interface ForumState {
  threads: Thread[];
  posts: Post[];
}
