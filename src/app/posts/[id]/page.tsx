"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { Post } from "@/app/_types/Post";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";

type PostApiResponse = {
  id: string;
  title: string;
  content: string;
  coverImageURL: string;
  createdAt: string;
  updatedAt: string;
  categories: {
    category: {
      id: string;
      name: string;
    };
  }[];
};

const Page: React.FC = () => {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { id } = useParams() as { id: string };

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const requestUrl = `/api/posts/${id}`;
        const response = await fetch(requestUrl, {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }
        const data = (await response.json()) as PostApiResponse;

        const transformedPost: Post = {
          id: data.id,
          title: data.title,
          content: data.content,
          coverImageURL: data.coverImageURL,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          categories: data.categories.map((cat) => cat.category),
        };

        setPost(transformedPost);
      } catch (e) {
        setFetchError(
          e instanceof Error ? e.message : "予期せぬエラーが発生しました",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (fetchError) {
    return <div className="text-red-500">{fetchError}</div>;
  }

  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  if (!post) {
    return <div>指定idの投稿の取得に失敗しました。</div>;
  }

  const safeHTML = DOMPurify.sanitize(post.content, {
    ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "br"],
  });
  const dtFmt = "YYYY-MM-DD";

  return (
    <main>
      <div className="space-y-3">
        <div className="mb-2 text-2xl font-bold">{post.title}</div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>投稿日: {dayjs(post.createdAt).format(dtFmt)}</div>
          <div className="flex space-x-1.5">
            {post.categories?.map((category) => (
              <div
                key={category.id}
                className={twMerge(
                  "rounded-md px-2 py-0.5",
                  "text-xs font-bold",
                  "border border-slate-400 text-slate-500",
                )}
              >
                {category.name}
              </div>
            ))}
          </div>
        </div>

        <div>
          <Image
            src={post.coverImageURL}
            alt={post.title}
            width={1365}
            height={768}
            priority
            className="rounded-xl"
          />
        </div>

        <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
      </div>
    </main>
  );
};

export default Page;
