import { Prisma, PrismaClient, CommitteeStatusEnum } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import {
  AddCommitteeMemberInput,
  AddCommitteePayload,
  CommitteeMemberRecord,
} from "./committee.type";

export type PrismaClientOrTx = PrismaClient | Prisma.TransactionClient;

export const committeeSelectFields = {
  id: true,
  committeeName: true,
  committeeAmount: true,
  commissionMaxMember: true,
  committeeStatus: true,
  noOfMonths: true,
  createdAt: true,
  fineAmount: true,
  extraDaysForFine: true,
  startCommitteeDate: true,
  committeeType: true,
} as const;

export const committeeDetailsSelect = {
  ...committeeSelectFields,
  createdBy: true,
} as const;

export const committeeMemberInclude = {
  user: {
    select: {
      id: true,
      name: true,
      phoneNo: true,
      email: true,
      role: true,
      UserWiseDraw: {
        select: {
          userDrawAmountPaid: true,
          fineAmountPaid: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  },
} as const;

export const committeeDrawSelect = {
  id: true,
  committeeId: true,
  committeeDrawAmount: true,
  committeeDrawPaidAmount: true,
  committeeDrawMinAmount: true,
  committeeDrawDate: true,
  committeeDrawTime: true,
} as const;

export const committeeDrawUserWiseSelect = {
  id: true,
  committeeId: true,
  drawId: true,
  userId: true,
  userDrawAmountPaid: true,
  fineAmountPaid: true,
} as const;

export type CommitteeSelectRecord = Prisma.CommitteeGetPayload<{
  select: typeof committeeSelectFields;
}>;

export type CommitteeDetailsRecord = Prisma.CommitteeGetPayload<{
  select: typeof committeeDetailsSelect;
}>;

export type CommitteeMemberWithUserRecord = Prisma.CommitteeMemberGetPayload<{
  include: typeof committeeMemberInclude;
}>;

export type CommitteeDrawRecordRaw = Prisma.CommitteeDrawGetPayload<{
  select: typeof committeeDrawSelect;
}>;

export type CommitteeDrawUserWiseRecordRaw = Prisma.UserWiseDrawGetPayload<{
  select: typeof committeeDrawUserWiseSelect;
}>;

export async function findCommitteesByAdmin(
  adminId: number
): Promise<CommitteeSelectRecord[]> {
  return prisma.committee.findMany({
    where: { createdBy: adminId },
    select: committeeSelectFields,
  });
}

export async function findCommitteesForMember(
  userId: number
): Promise<CommitteeSelectRecord[]> {
  const memberCommittees = await prisma.committeeMember.findMany({
    where: { userId },
    select: {
      committee: {
        select: committeeSelectFields,
      },
    },
  });

  return memberCommittees.map(({ committee }) => committee);
}

export async function createCommitteeRecord(
  data: AddCommitteePayload
): Promise<CommitteeSelectRecord> {
  return prisma.committee.create({
    data,
    select: committeeSelectFields,
  });
}

export function createScopedRepository(client: PrismaClientOrTx) {
  return {
    createCommitteeMember(
      data: AddCommitteeMemberInput
    ): Promise<CommitteeMemberRecord> {
      return client.committeeMember.create({
        data,
        select: {
          id: true,
          userId: true,
          committeeId: true,
          createdAt: true,
        },
      });
    },
    findCommitteeMember(
      committeeId: number,
      userId: number
    ): Promise<{ id: number } | null> {
      return client.committeeMember.findFirst({
        where: {
          committeeId,
          userId,
        },
        select: {
          id: true,
        },
      });
    },
    findCommitteeMembers(
      committeeId: number
    ): Promise<CommitteeMemberRecord[]> {
      return client.committeeMember.findMany({
        where: { committeeId },
        select: {
          id: true,
          userId: true,
          committeeId: true,
          createdAt: true,
        },
      });
    },
    findCommitteeDetails(
      committeeId: number
    ): Promise<CommitteeDetailsRecord | null> {
      return client.committee.findUnique({
        where: { id: committeeId },
        select: committeeDetailsSelect,
      });
    },
    createCommitteeDraws(
      data: Prisma.CommitteeDrawCreateManyInput[]
    ): Promise<Prisma.BatchPayload> {
      return client.committeeDraw.createMany({
        data,
      });
    },
    updateCommitteeStatus(
      committeeId: number,
      status: CommitteeStatusEnum
    ): Promise<CommitteeDetailsRecord> {
      return client.committee.update({
        where: { id: committeeId },
        data: {
          committeeStatus: status,
        },
        select: committeeDetailsSelect,
      });
    },
    upsertUserWiseDraw(
      data: {
        committeeId: number;
        drawId: number;
        userId: number;
        userDrawAmountPaid: number;
        fineAmountPaid: number;
      }
    ) {
      return client.userWiseDraw.upsert({
        where: {
          uniqueUserWiseDraw: {
            userId: data.userId,
            drawId: data.drawId,
            committeeId: data.committeeId,
          },
        },
        update: {
          userDrawAmountPaid: data.userDrawAmountPaid,
          fineAmountPaid: data.fineAmountPaid,
          updatedAt: new Date(),
        },
        create: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          User: true,
        },
      });
    },
    countCommitteeMembers(committeeId: number) {
      return client.committeeMember.count({
        where: { committeeId },
      });
    },
    findCommitteeDrawById(drawId: number) {
      return client.committeeDraw.findUnique({
        where: { id: drawId },
        select: {
          id: true,
          committeeDrawDate: true,
          committeeDrawAmount: true,
          committeeId: true,
          committeeDrawMinAmount: true,
          committeeDrawTime: true,
        },
      });
    },
    updateCommitteeDrawAmount(
      drawId: number,
      committeeDrawAmount: number
    ): Promise<CommitteeDrawRecordRaw> {
      return prisma.committeeDraw.update({
        where: { id: drawId },
        data: { committeeDrawAmount },
      });
    },
    findCommitteeDrawList(committeeId: number): Promise<CommitteeDrawRecordRaw[]> {
      return prisma.committeeDraw.findMany({
        where: { committeeId },
        select: committeeDrawSelect,
      });
    },
    findUserWiseDrawListByCommitteeIdAndUserId(committeeId: number, userId: number): Promise<CommitteeDrawUserWiseRecordRaw[]> {
      return prisma.userWiseDraw.findMany({
        where: { committeeId, userId },
        select: committeeDrawUserWiseSelect,
      });
    },
    findUserWiseDrawById(drawId: number, userId: number, committeeId: number): Promise<CommitteeDrawUserWiseRecordRaw | null> {
      return client.userWiseDraw.findUnique({
        where: { id: drawId, userId, committeeId },
        select: committeeDrawUserWiseSelect,
      });
    },
  };
}

export const committeeReadRepository = createScopedRepository(prisma);

export async function findCommitteeMembersWithUser(
  committeeId: number
): Promise<CommitteeMemberWithUserRecord[]> {
  return prisma.committeeMember.findMany({
    where: { committeeId },
    include: committeeMemberInclude,
  });
}

export async function findCommitteeMembersWithUserAndDraw(
  committeeId: number,
  drawId: number
) {
  // Query UserWiseDraw directly since it's not a relation on CommitteeMember
  // return prisma.userWiseDraw.findMany({
  //   where: {
  //     committeeId,
  //     drawId
  //   },
  //   include: {
  //     User: true,
  //     Committee: true,
  //     CommitteeDraw: true,
  //   },
  //   orderBy: {
  //     userId: 'asc',
  //   },
  // });

  return prisma.committeeMember.findMany({
    where: { committeeId },
    include: {
      user: {
        include: {
          UserWiseDraw: {
            where: { committeeId, drawId },
            include: {
              Committee: true,
              CommitteeDraw: true
            }
          }
        }
      }
    },
    orderBy: {
      userId: "asc"
    }
  });
  
}


export async function findCommitteeDrawList(
  committeeId: number
): Promise<CommitteeDrawRecordRaw[]> {
  return prisma.committeeDraw.findMany({
    where: { committeeId },
    select: committeeDrawSelect,
    orderBy: {
      committeeDrawDate: "asc",
    },
  });
}

type TransactionOptions = Parameters<typeof prisma.$transaction>[1];

export async function runInTransaction<T>(
  handler: (context: {
    repo: ReturnType<typeof createScopedRepository>;
    tx: Prisma.TransactionClient;
  }) => Promise<T>,
  options?: TransactionOptions
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    const repository = createScopedRepository(tx);
    return handler({ repo: repository, tx });
  }, options);
}

export async function findUserWiseDrawListByCommitteeIdAndUserId(committeeId: number, userId: number): Promise<CommitteeDrawRecordRaw[]> {
  return prisma.userWiseDraw.findMany({
    where: { committeeId, userId },
    select: committeeDrawSelect,
  });
}

export async function updateUserWiseDrawCompleted(drawId: number, userId: number, committeeId: number, isDrawCompleted: boolean) {
  // Note: Prisma client needs regeneration after schema update for isDrawCompleted field
  const result = await (prisma.userWiseDraw.update as any)({
    where: {
      uniqueUserWiseDraw: {
        userId,
        drawId,
        committeeId,
      },
    },
    data: { 
      isDrawCompleted: isDrawCompleted,
    },
    include: {
      User: true,
    },
  });
  return result;
}

export async function findUserWiseDrawById(drawId: number, userId: number, committeeId: number): Promise<CommitteeDrawUserWiseRecordRaw | null> {
  return prisma.userWiseDraw.findUnique({
    where: { id: drawId, userId, committeeId },
    select: committeeDrawUserWiseSelect,
  });
}