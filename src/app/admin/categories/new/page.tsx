"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { Category } from "@/app/_types/Category";
import Link from "next/link";
import { useRouter } from "next/navigation";

type CategoryApiResponse = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

const Page: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categories, setCategories] = useState<Category[] | null>(null);

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

      const apiResBody = (await res.json()) as CategoryApiResponse[];
      setCategories(
        apiResBody.map((body) => ({
          id: body.id,
          name: body.name,
        })),
      );
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

  useEffect(() => {
    fetchCategories();
  }, []);

  const updateNewCategoryName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategoryName(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const requestBody = JSON.stringify({ name: newCategoryName });
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      alert("カテゴリを作成しました");
      setNewCategoryName("");
      await fetchCategories();
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `カテゴリの作成に失敗しました: ${error.message}`
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

  if (!categories) {
    return <div className="text-red-500">{fetchErrorMsg}</div>;
  }

  return (
    <main>
      <div className="mb-4 text-2xl font-bold">カテゴリの新規作成</div>

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
        className={twMerge("mb-4 space-y-4", isSubmitting && "opacity-50")}
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
            placeholder="新しいカテゴリの名前を記入してください"
            value={newCategoryName}
            onChange={updateNewCategoryName}
            autoComplete="off"
            required
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => router.push("/admin/categories")}
            className={twMerge(
              "rounded-md px-5 py-1 font-bold",
              "bg-gray-300 text-gray-700 hover:bg-gray-400",
            )}
          >
            戻る
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
            カテゴリを作成
          </button>
        </div>
      </form>

      <div className="mb-2 text-2xl font-bold">作成されたカテゴリの一覧</div>
      {categories.length === 0 ? (
        <div className="text-gray-500">
          （カテゴリは1個も作成されていません）
        </div>
      ) : (
        <div>
          <div className="mb-2">
            クリックすると各カテゴリの名前編集・削除画面に移動します。
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className={twMerge(
                  "rounded-md px-2 py-0.5",
                  "border border-slate-400 text-slate-500",
                )}
              >
                <Link href={`/admin/categories/${category.id}`}>
                  {category.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default Page;
