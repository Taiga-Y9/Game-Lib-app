import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import type { Post } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

type RequestBody = {
  title: string;
  content: string;
  coverImageURL: string;
  categoryIds: string[];
};

export const PUT = async (req: NextRequest, routeParams: RouteParams) => {
  try {
    const { id } = await routeParams.params;
    const requestBody: RequestBody = await req.json();
    const { title, content, coverImageURL, categoryIds } = requestBody;

    // 既存の投稿記事を更新
    const post: Post = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        coverImageURL,
        // 既存のカテゴリ関連を全削除して新しく作成
        categories: {
          deleteMany: {},
          create: categoryIds.map((categoryId) => ({
            categoryId,
          })),
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error(error);

    // 外部キー制約違反のエラーをキャッチ
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "指定されたカテゴリの一部が存在しません" },
          { status: 400 },
        );
      }
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "指定された投稿記事が見つかりません" },
          { status: 404 },
        );
      }
    }

    return NextResponse.json(
      { error: "投稿記事の更新に失敗しました" },
      { status: 500 },
    );
  }
};

export const DELETE = async (req: NextRequest, routeParams: RouteParams) => {
  try {
    const { id } = await routeParams.params;
    const post: Post = await prisma.post.delete({ where: { id } });
    return NextResponse.json({ msg: `「${post.title}」を削除しました。` });
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "指定された投稿記事が見つかりません" },
          { status: 404 },
        );
      }
    }

    return NextResponse.json(
      { error: "投稿記事の削除に失敗しました" },
      { status: 500 },
    );
  }
};
