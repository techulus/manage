import { Prisma, Project } from "@prisma/client";
import { prisma } from "./db";

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
}: {
  ownerId: string;
  search?: string;
}): Promise<{
  projects: Project[];
}> {
  const dbQuery: Prisma.ProjectFindManyArgs = {
    where: {
      organizationId: {
        equals: ownerId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  };

  if (search) {
    dbQuery.where!["name"] = {
      search,
    };
  }

  const projects: Project[] = await prisma.project.findMany(dbQuery);

  return { projects };
}
