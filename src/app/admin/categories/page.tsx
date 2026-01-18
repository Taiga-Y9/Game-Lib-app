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

type Category = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

const Page: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const requestUrl = "/api/categories";
      const res = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        setCategories(null);
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      const apiResBody = (await res.json()) as Category[];
      setCategories(apiResBody);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `カテゴリの一覧のフェッチに失敗しました: ${error.message}`
          : `予期せぬエラーが発生しました ${error}`;
      console.error(errorMsg);
      setFetchErrorMsg(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      alert("削除しました");
      await fetchCategories();
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
    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  if (!categories) {
    return <div className="text-red-500">{fetchErrorMsg}</div>;
  }

  return (
    <main>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-2xl font-bold">カテゴリの管理</div>
        <Link
          href="/admin/categories/new"
          className={twMerge(
            "rounded-md px-4 py-2 font-bold",
            "bg-indigo-500 text-white hover:bg-indigo-600",
          )}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          新規作成
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="text-gray-500">
          （カテゴリは1個も作成されていません）
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-lg border border-slate-300 p-3"
            >
              <div className="text-lg font-bold">{category.name}</div>
              <div className="flex space-x-2">
                <Link
                  href={`/admin/categories/${category.id}`}
                  className={twMerge(
                    "rounded-md px-3 py-1.5 text-sm font-bold",
                    "bg-blue-500 text-white hover:bg-blue-600",
                  )}
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-1" />
                  編集
                </Link>
                <button
                  onClick={() => handleDelete(category.id, category.name)}
                  disabled={deletingId === category.id}
                  className={twMerge(
                    "rounded-md px-3 py-1.5 text-sm font-bold",
                    "bg-red-500 text-white hover:bg-red-600",
                    deletingId === category.id && "opacity-50",
                  )}
                >
                  {deletingId === category.id ? (
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
          ))}
        </div>
      )}
    </main>
  );
};

export default Page;
