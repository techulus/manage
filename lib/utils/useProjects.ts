import { Prisma, Project } from "@prisma/client";
import { prisma } from "./db";

export const LIMIT = 15;

export async function getProjectById(id: number): Promise<Project | null> {
  return prisma.project.findUnique({
    where: {
      id,
    },
  });
}

export async function getProjectsForOwner({
  ownerId,
  search,
  page = 1,
}: {
  ownerId: string;
  search?: string;
  page?: number;
}): Promise<{
  projects: Project[];
  count: number;
}> {
  const dbQuery: Prisma.ProjectFindManyArgs = {
    where: {
      ownerId: {
        equals: ownerId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: LIMIT,
    skip: (page - 1) * LIMIT,
  };

  if (search) {
    dbQuery.where!["name"] = {
      search,
    };
  }

  const [projects, count]: [Project[], number] = await prisma.$transaction([
    prisma.project.findMany(dbQuery),
    prisma.project.count({
      where: {
        ownerId: {
          equals: ownerId,
        },
      },
    }),
  ]);

  return { projects, count };
}
