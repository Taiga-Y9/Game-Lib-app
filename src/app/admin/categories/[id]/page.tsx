"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { useRouter, useParams } from "next/navigation";

type Category = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

const Page: React.FC = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const fetchCategory = async () => {
    try {
      setIsLoading(true);
      const requestUrl = "/api/categories";
      const res = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      const apiResBody = (await res.json()) as Category[];
      const foundCategory = apiResBody.find((cat) => cat.id === id);

      if (!foundCategory) {
        throw new Error("指定されたカテゴリが見つかりません");
      }

      setCategory(foundCategory);
      setCategoryName(foundCategory.name);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `カテゴリのフェッチに失敗しました: ${error.message}`
          : `予期せぬエラーが発生しました ${error}`;
      console.error(errorMsg);
      setFetchErrorMsg(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const requestBody = JSON.stringify({ name: categoryName });
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      alert("カテゴリを更新しました");
      router.push("/admin/categories");
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `カテゴリの更新に失敗しました: ${error.message}`
          : `予期せぬエラーが発生しました`;
      console.error(errorMsg);
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`「${category?.name}」を削除しますか？`)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      alert("削除しました");
      router.push("/admin/categories");
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `削除に失敗しました: ${error.message}`
          : `予期せぬエラーが発生しました`;
      console.error(errorMsg);
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  if (!category) {
    return <div className="text-red-500">{fetchErrorMsg}</div>;
  }

  return (
    <main>
      <div className="mb-4 text-2xl font-bold">カテゴリの編集</div>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex items-center rounded-lg bg-white px-8 py-4 shadow-lg">
            <FontAwesomeIcon
              icon={faSpinner}
              className="mr-2 animate-spin text-gray-500"
            />
            <div className="flex items-center text-gray-500">処理中...</div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={twMerge("space-y-4", isSubmitting && "opacity-50")}
      >
        <div className="space-y-1">
          <label htmlFor="name" className="block font-bold">
            名前
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full rounded-md border-2 px-2 py-1"
            placeholder="カテゴリの名前を記入してください"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            autoComplete="off"
            required
          />
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className={twMerge(
              "rounded-md px-5 py-1 font-bold",
              "bg-red-500 text-white hover:bg-red-600",
              isSubmitting && "opacity-50",
            )}
          >
            <FontAwesomeIcon icon={faTrash} className="mr-1" />
            削除
          </button>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => router.back()}
              className={twMerge(
                "rounded-md px-5 py-1 font-bold",
                "bg-gray-300 text-gray-700 hover:bg-gray-400",
              )}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={twMerge(
                "rounded-md px-5 py-1 font-bold",
                "bg-indigo-500 text-white hover:bg-indigo-600",
                isSubmitting && "opacity-50",
              )}
            >
              更新
            </button>
          </div>
        </div>
      </form>
    </main>
  );
};

export default Page;
