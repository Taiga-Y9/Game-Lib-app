"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faTrash,
  faEdit,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
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
  const [isLoading, setIsLoading] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostApiResponse[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const requestUrl = "/api/posts";
      const res = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        setPosts(null);
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      const apiResBody = (await res.json()) as PostApiResponse[];
      setPosts(apiResBody);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `投稿記事の一覧のフェッチに失敗しました: ${error.message}`
          : `予期せぬエラーが発生しました ${error}`;
      console.error(errorMsg);
      setFetchErrorMsg(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`「${title}」を削除しますか？`)) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      alert("削除しました");
      await fetchPosts();
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `削除に失敗しました: ${error.message}`
          : `予期せぬエラーが発生しました`;
      console.error(errorMsg);
      alert(errorMsg);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  if (!posts) {
    return <div className="text-red-500">{fetchErrorMsg}</div>;
  }

  const dtFmt = "YYYY-MM-DD HH:mm";

  return (
    <main>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-2xl font-bold">投稿記事の管理</div>
        <Link
          href="/admin/posts/new"
          className={twMerge(
            "rounded-md px-4 py-2 font-bold",
            "bg-indigo-500 text-white hover:bg-indigo-600",
          )}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          新規作成
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-gray-500">
          （投稿記事は1個も作成されていません）
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-lg border border-slate-300 p-4"
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <div className="mb-1 text-lg font-bold">{post.title}</div>
                  <div className="text-sm text-gray-600">
                    作成: {dayjs(post.createdAt).format(dtFmt)} / 更新:{" "}
                    {dayjs(post.updatedAt).format(dtFmt)}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className={twMerge(
                      "rounded-md px-3 py-1.5 text-sm font-bold",
                      "bg-blue-500 text-white hover:bg-blue-600",
                    )}
                  >
                    <FontAwesomeIcon icon={faEdit} className="mr-1" />
                    編集
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id, post.title)}
                    disabled={deletingId === post.id}
                    className={twMerge(
                      "rounded-md px-3 py-1.5 text-sm font-bold",
                      "bg-red-500 text-white hover:bg-red-600",
                      deletingId === post.id && "opacity-50",
                    )}
                  >
                    {deletingId === post.id ? (
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="animate-spin"
                      />
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faTrash} className="mr-1" />
                        削除
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex space-x-1.5">
                {post.categories.map((cat) => (
                  <div
                    key={cat.category.id}
                    className={twMerge(
                      "rounded-md px-2 py-0.5",
                      "text-xs font-bold",
                      "border border-slate-400 text-slate-500",
                    )}
                  >
                    {cat.category.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Page;
