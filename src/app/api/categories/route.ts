import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export const GET = async (_req: NextRequest) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" }, // nameで並び替え（createdAtは存在しない）
    });

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await prisma.postCategory.count({
          where: { categoryId: cat.id },
        });
        return { ...cat, _count: { posts: count } };
      }),
    );

    return NextResponse.json(categoriesWithCount);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "カテゴリの取得に失敗しました" },
      { status: 500 },
    );
  }
};
