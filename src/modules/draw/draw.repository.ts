import { Prisma, PrismaClient, CommitteeStatusEnum } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import {
  AddCommitteeMemberInput,
  CommitteeMemberRecord,
} from "./draw.type";

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
  fineStartDate: true,
  lotteryAmount: true,
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
  isUserDrawCompleted: true,
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
        orderBy: {
          committeeDrawDate: "asc",
        },
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
        where: { uniqueUserWiseDraw: { drawId, userId, committeeId } },
        select: committeeDrawUserWiseSelect,
      });
    },

    findComUserWiseDrawById(drawId: number, committeeId: number): Promise<CommitteeDrawUserWiseRecordRaw | null> {
      return client.userWiseDraw.findFirst({
        where: {  drawId, committeeId, isUserDrawCompleted: true } ,
        select: committeeDrawUserWiseSelect,
      });
    },
    findUserWiseDrawByAndUserIdAndCommitteeId(committeeId: number, userId: number): Promise<CommitteeDrawUserWiseRecordRaw | null> {
      // Note: Prisma client needs regeneration after schema update for isUserDrawCompleted field
      return (client.userWiseDraw.findFirst as any)({
        where: { 
          userId,
          committeeId, 
          isUserDrawCompleted: true 
        },
        select: committeeDrawUserWiseSelect,
      });
    },
    // async countUserWisePaidAmountbyCommitteeIdAndDrawId(committeeId: number, drawId: number): Promise<{ _sum: { userDrawAmountPaid: number; fineAmountPaid: number } }> {
    //   const result = await prisma.userWiseDraw.aggregate({
    //     where: { committeeId, drawId },
    //     _sum: {
    //       userDrawAmountPaid: true,
    //       fineAmountPaid: true,
    //     },
    //   });
    //   return {
    //     _sum: {
    //       userDrawAmountPaid: Number(result._sum.userDrawAmountPaid ?? 0),
    //       fineAmountPaid: Number(result._sum.fineAmountPaid ?? 0),
    //     },
    //   };
    // }
    async countUserWisePaidAmountbyCommitteeIdAndDrawId(committeeId: number, drawId: number): Promise<number> {
        return await prisma.userWiseDraw.count({
          where: {
            committeeId,
            drawId,
            userDrawAmountPaid: {
              gt: 0,
            },
          },
        });
      },
      async updateCommitteeDrawCompleted(committeeId: number, drawId: number, isDrawCompleted: boolean): Promise<CommitteeDrawRecordRaw> {
        return await prisma.committeeDraw.update({
          where: { id: drawId, committeeId },
          data: { isDrawCompleted },
        });
      }
    }
}


export const drawRepository = createScopedRepository(prisma);


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
      createdAt: "asc"
    }
  });
}

export async function updateUserWiseDrawCompleted(drawId: number, userId: number, committeeId: number, isUserDrawCompleted: boolean) {
  // Note: Prisma client needs regeneration after schema update for isUserDrawCompleted field
  const result = await (prisma.userWiseDraw.update as any)({
    where: {
      uniqueUserWiseDraw: {
        userId,
        drawId,
        committeeId,
      },
    },
    data: { 
      isUserDrawCompleted: isUserDrawCompleted,
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

export async function countUserWisePaidAmountbyCommitteeIdAndDrawId(committeeId: number, drawId: number): Promise<number> {
  return await prisma.userWiseDraw.count({
    where: {
      committeeId,
      drawId,
      userDrawAmountPaid: {
        gt: 0,
      },
    },
  });
}

// export async function updateCommitteeDrawCompleted(committeeId: number, drawId: number, isUserDrawCompleted: boolean) {
//   return await prisma.committeeDraw.update({
//     where: { id: drawId },
//     data: { isUserDrawCompleted },
//   });
// }