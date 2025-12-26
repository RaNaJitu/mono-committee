import { CommitteeStatusEnum, Prisma } from "@prisma/client";
import { CommitteeStatus, UserRole } from "../../enum/constants";
import { BadRequestException } from "../../exception/badrequest.exception";
import { NotFoundException } from "../../exception/notfound.exception";
import {
  AuthenticatedUserPayload,
} from "../auth/auth.types";
import {
  CommitteeAnalysis,
  CommitteeAnalysisQuerystring,
  CommitteeDetails,
  CommitteeDrawQuerystring,
  CommitteeDrawRecord,
  CommitteeTypeEnum,
  UpdateDrawAmountBody,
  UpdateDrawAmountResponse,
  UserWiseDrawPaidBody,
  UserWiseDrawRecord,
} from "./draw.type";
import {
  CommitteeDetailsRecord,
  CommitteeDrawRecordRaw,
  committeeReadRepository,
  findCommitteeMembersWithUserAndDraw,
  updateUserWiseDrawCompleted as updateUserWiseDrawCompletedRepo,
} from "./draw.repository";
import { ForbiddenException } from "../../exception/forbidden.exception";


const statusFromPrisma: Record<CommitteeStatusEnum, CommitteeStatus> = {
  [CommitteeStatusEnum.INACTIVE]: CommitteeStatus.INACTIVE,
  [CommitteeStatusEnum.ACTIVE]: CommitteeStatus.ACTIVE,
  [CommitteeStatusEnum.COMPLETED]: CommitteeStatus.COMPLETED,
};

const ADMIN_ONLY_ERROR = {
  message: "You are not authorized to perform this action",
  description: "Only committee admins can execute this operation",
};

type UserWiseDrawRawRecord = Awaited<
  ReturnType<typeof committeeReadRepository["upsertUserWiseDraw"]>
> & {
  isDrawCompleted?: boolean;
};

const toNumber = (value: Prisma.Decimal | number | null | undefined): number =>
  value === null || value === undefined ? 0 : Number(value);

const mapCommitteeDetails = (
  record: CommitteeDetailsRecord
): CommitteeDetails => ({
  id: record.id,
  committeeName: record.committeeName,
  committeeAmount: Number(record.committeeAmount),
  commissionMaxMember: record.commissionMaxMember,
  noOfMonths: record.noOfMonths,
  createdBy: record.createdBy,
  committeeType: record.committeeType as CommitteeTypeEnum,
  fineAmount: toNumber(record.fineAmount),
  extraDaysForFine: record.extraDaysForFine ?? 0,
  startCommitteeDate: record.startCommitteeDate ?? null,
  fineStartDate: record.fineStartDate ?? null,
  lotteryAmount: Number(record.lotteryAmount),
});

const mapCommitteeDrawRecord = (
  record: CommitteeDrawRecordRaw
): CommitteeDrawRecord => ({
  id: record.id,
  committeeId: record.committeeId,
  committeeDrawAmount: Number(record.committeeDrawAmount),
  committeeDrawPaidAmount: Number(record.committeeDrawPaidAmount),
  committeeDrawMinAmount: Number(record.committeeDrawMinAmount),
  committeeDrawDate: record.committeeDrawDate,
  committeeDrawTime: record.committeeDrawTime,
});

const mapUserWiseDrawRecord = (
  record: UserWiseDrawRawRecord
): UserWiseDrawRecord => {
  if (!record.User) {
    throw new Error("User relation is required for UserWiseDrawRecord");
  }
  return {
    id: record.id,
    committeeId: record.committeeId,
    drawId: record.drawId,
    userId: record.userId,
    user: {
      id: record.User.id,
      isDrawCompleted: record.isDrawCompleted ?? false,
      name: record.User.name,
      phoneNo: record.User.phoneNo,
      email: record.User.email || "",
      role: String(record.User.role),
      userDrawAmountPaid: Number(record.userDrawAmountPaid),
      fineAmountPaid: Number(record.fineAmountPaid),
    },
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
};

function assertAdmin(authUser: AuthenticatedUserPayload): void {
  if (authUser.role !== UserRole.ADMIN) {
    throw new BadRequestException(ADMIN_ONLY_ERROR);
  }
}

function ensureCommitteeIdProvided(committeeId?: number): number {
  if (!committeeId && committeeId !== 0) {
    throw new BadRequestException({
      message: "Committee ID is required",
      description: "Committee ID is required",
    });
  }
  return Number(committeeId);
}

async function getCommitteeDetailsOrThrow(
  committeeId: number
): Promise<CommitteeDetails> {
  const record = await committeeReadRepository.findCommitteeDetails(committeeId);
  if (!record) {
    throw new NotFoundException({
      message: "Committee not found",
      description: "Committee not found",
    });
  }
  return mapCommitteeDetails(record);
}

async function calculateFineAmountInternal(
  committeeDetails: CommitteeDetails,
  drawId: number
): Promise<number> {
  const today = new Date();
  const draw = await committeeReadRepository.findCommitteeDrawById(drawId);

  if (!draw?.committeeDrawDate) {
    return 0;
  }

  if (!committeeDetails.fineStartDate) {
    return 0;
  }

  const drawFineStartDate = new Date(committeeDetails.fineStartDate);
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const drawFineStartDateOnly = new Date(
    drawFineStartDate.getFullYear(),
    drawFineStartDate.getMonth(),
    drawFineStartDate.getDate()
  );

  const diffTime = todayOnly.getTime() - drawFineStartDateOnly.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  
  return (diffDays) * committeeDetails.fineAmount;

  // return 0;
}

async function calculatePaidAmountByUserInternal(
  committeeDetails: CommitteeDetails,
  drawId: number
): Promise<number> {
  const draw = await committeeReadRepository.findCommitteeDrawById(drawId);

  if (!draw || draw.committeeId !== committeeDetails.id) {
    throw new BadRequestException({
      message: "Draw not found",
      description: "Unable to locate draw for committee",
    });
  }

  const drawDate = new Date(draw.committeeDrawDate);
  if (drawDate > new Date()) {
    throw new BadRequestException({
      message: "Draw not started yet",
      description: "Draw not started yet",
    });
  }

  const totalMembers = await committeeReadRepository.countCommitteeMembers(
    committeeDetails.id
  );
  if (totalMembers === 0) {
    throw new BadRequestException({
      message: "No committee members",
      description: "Committee has no members attached",
    });
  }

  const drawAmount =
    (committeeDetails.committeeAmount - toNumber(draw.committeeDrawAmount)) /
    totalMembers;

  return drawAmount;
}

async function calculatePaidAmountByUserInternalForLottery(
  committeeDetails: CommitteeDetails,
  payload: UserWiseDrawPaidBody
): Promise<number> {

  /** 
   * TODO: find users who has belonge to that committee
   * TODO: check the user has took the committee draw in lottery that user has increase the what envry the lottery amount of the committee
  
  */
  
  const lotteryAmount = Number(committeeDetails.lotteryAmount);
  if(!lotteryAmount) {
    throw new BadRequestException({
      message: "Lottery amount is not set",
      description: "Lottery amount is not set",
    });
  }
  const draw = await committeeReadRepository.findCommitteeDrawById(payload.drawId);

  if (!draw || draw.committeeId !== committeeDetails.id) {
    throw new BadRequestException({
      message: "Draw not found",
      description: "Unable to locate draw for committee",
    });
  }

  const drawDate = new Date(draw.committeeDrawDate);
  if (drawDate > new Date()) {
    throw new BadRequestException({
      message: "Draw not started yet",
      description: "Draw not started yet",
    });
  }

  const totalMembers = await committeeReadRepository.countCommitteeMembers(
    committeeDetails.id
  );
  if (totalMembers === 0) {
    throw new BadRequestException({
      message: "No committee members",
      description: "Committee has no members attached",
    });
  }

  const isUserHasTookCommitteeDraw = await committeeReadRepository.findUserWiseDrawByAndUserIdAndCommitteeId(payload.committeeId, payload.userId);

  
  let drawAmount = 0;
  if (isUserHasTookCommitteeDraw?.isDrawCompleted) {
    drawAmount = Number(isUserHasTookCommitteeDraw.userDrawAmountPaid) + Number(committeeDetails.lotteryAmount);
  } else {
    drawAmount = Number(draw.committeeDrawAmount)
  }

  return drawAmount;
}

export async function getCommitteeDrawListForUser(
  _authUser: AuthenticatedUserPayload,
  committeeId?: number
): Promise<CommitteeDrawRecord[]> {
  const id = ensureCommitteeIdProvided(committeeId);
  const drawList = await committeeReadRepository.findCommitteeDrawList(id);
  return drawList.map(mapCommitteeDrawRecord);
}

export async function updateUserWiseDrawPaidAmount(
authUser: AuthenticatedUserPayload,
  payload: UserWiseDrawPaidBody
): Promise<UserWiseDrawRecord> {
  assertAdmin(authUser);

  const committeeDetails: any = await getCommitteeDetailsOrThrow(
    Number(payload.committeeId)
  );

  if (committeeDetails.createdBy !== Number(authUser.id)) {
    throw new NotFoundException({
      message: "Committee not found",
      description: "Committee not found",
    });
  }
  let drawAmount = 0;
  let fineAmount = 0;
  switch (committeeDetails.committeeType) {
    case CommitteeTypeEnum.LOTTERY:
      fineAmount = await calculateFineAmountInternal(
        committeeDetails,
        Number(payload.drawId)
      );
      drawAmount = await calculatePaidAmountByUserInternalForLottery(
        committeeDetails,
        payload
      );
      break;
    case CommitteeTypeEnum.NORMAL:
      fineAmount = await calculateFineAmountInternal(
        committeeDetails,
        Number(payload.drawId)
      );
      drawAmount = await calculatePaidAmountByUserInternal(
        committeeDetails,
        Number(payload.drawId)
      );
      break;
    default:
      throw new BadRequestException({
        message: "Invalid committee type",
        description: "Invalid committee type",
      });
  }

  const record = await committeeReadRepository.upsertUserWiseDraw({
    committeeId: Number(payload.committeeId),
    drawId: Number(payload.drawId),
    userId: Number(payload.userId),
    userDrawAmountPaid: Number(drawAmount.toFixed(2)),
    fineAmountPaid: Number(fineAmount.toFixed(2)),
  });

  return mapUserWiseDrawRecord(record);
}

export async function getUserWiseDrawPaidAmount(
  _authUser: AuthenticatedUserPayload,
  payload: CommitteeDrawQuerystring
): Promise<UserWiseDrawRecord[]> {
  // assertAdmin(authUser);

  const committeeDetails = await getCommitteeDetailsOrThrow(
    Number(payload.committeeId)
  );
  if (!committeeDetails) {
    throw new NotFoundException({
      message: "Committee not found",
      description: "Committee not found",
    });
  }

  const draw = await committeeReadRepository.findCommitteeDrawById(Number(payload.drawId));
  if (!draw) {
    throw new NotFoundException({
      message: "Draw not found",
      description: "Draw not found",
    });
  }
  if(draw.committeeDrawDate > new Date()) {
    throw new BadRequestException({
      message: "Draw not started yet",
      description: "Draw not started yet",
    });
  }

  const records = await findCommitteeMembersWithUserAndDraw(
    Number(payload.committeeId),
    Number(payload.drawId)
  );
  // Transform CommitteeMember with nested user.UserWiseDraw to UserWiseDrawRecord[]
  const result: UserWiseDrawRecord[] = [];
  for (const member of records) {
    const userWiseDraws: any = member.user.UserWiseDraw || [];
    
    if (userWiseDraws.length === 0) {
      // If no UserWiseDraw record exists, create one with 0 amounts
      result.push({
        id: 0, // Placeholder ID since record doesn't exist
        committeeId: Number(payload.committeeId),
        drawId: Number(payload.drawId),
        userId: member.userId,
        user: {
          id: member.user.id,
          name: member.user.name,
          isDrawCompleted: userWiseDraws.length > 0 ? userWiseDraws[0].isDrawCompleted : false,
          phoneNo: member.user.phoneNo,
          email: member.user.email || "",
          role: String(member.user.role),
          userDrawAmountPaid: 0,
          fineAmountPaid: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      // Process existing UserWiseDraw records
      for (const userWiseDraw of userWiseDraws) {
        result.push({
          id: userWiseDraw.id,
          committeeId: userWiseDraw.committeeId,
          drawId: userWiseDraw.drawId,
          userId: userWiseDraw.userId,
          user: {
            id: member.user.id,
            isDrawCompleted: userWiseDraw.isDrawCompleted,
            name: member.user.name,
            phoneNo: member.user.phoneNo,
            email: member.user.email || "",
            role: String(member.user.role),
            userDrawAmountPaid: toNumber(userWiseDraw.userDrawAmountPaid),
            fineAmountPaid: toNumber(userWiseDraw.fineAmountPaid),
          },
          createdAt: userWiseDraw.createdAt,
          updatedAt: userWiseDraw.updatedAt,
        });
      }
    }
  }

  return result;
}


//#region Update Draw Amount
export async function updateDrawAmount(
  authUser: AuthenticatedUserPayload,
  payload: UpdateDrawAmountBody
): Promise<UpdateDrawAmountResponse> {
  assertAdmin(authUser);

  const committeeDetails = await getCommitteeDetailsOrThrow(
    Number(payload.committeeId)
  );

  if(!committeeDetails) {
    throw new NotFoundException({
      message: "Committee not found",
      description: "Committee not found",
    });
  }
  
  if (committeeDetails.createdBy !== Number(authUser.id)) {
    throw new ForbiddenException({
      message: "You are not authorized to update draw amount",
      description: "You are not authorized to update draw amount",
    });
  }

  const draw: any  = await committeeReadRepository.findCommitteeDrawById(Number(payload.drawId));
  if (!draw) {
    throw new NotFoundException({
      message: "Draw not found",
      description: "Draw not found",
    });
  }
  
  if (draw.committeeDrawDate > new Date()) {
    throw new BadRequestException({
      message: "Draw not started yet",
      description: "Draw not started yet",
    });
  }
  
  // Check if draw amount is already set (not zero)
  const currentAmount = Number(draw.committeeDrawAmount);
  if (currentAmount !== 0) {
    throw new BadRequestException({
      message: "Draw amount already updated",
      description: "Draw amount cannot be updated once it has been set",
    });
  }

  
  // Validate that the new amount is not less than the minimum required amount
  const minAmount = Number(draw.committeeDrawMinAmount);
  const newAmount = Number(payload.amount);
  if (newAmount < minAmount) {
    throw new BadRequestException({
      message: `Draw amount cannot be less than the ${minAmount}`,
      description: `Draw amount must be at least ${minAmount}`,
    });
  }

  const record = await committeeReadRepository.updateCommitteeDrawAmount(
    Number(draw.id),
    Number(payload.amount),
  );

  return {
    id: record.id,
    committeeId: record.committeeId,
    drawId: record.id, // Use record.id as drawId since the record is the draw itself
    amount: Number(record.committeeDrawAmount),
  };
}
//#endregion


//#region Get Committee Analysis
export async function getCommitteeAnalysis(
  authUser: AuthenticatedUserPayload,
  payload: CommitteeAnalysisQuerystring
): Promise<CommitteeAnalysis> { 

  const committeeDetails = await getCommitteeDetailsOrThrow(payload.committeeId);

  const totalMembers = await committeeReadRepository.countCommitteeMembers(committeeDetails.id);
  const userWiseDraws =await committeeReadRepository.findUserWiseDrawListByCommitteeIdAndUserId(payload.committeeId, Number(authUser.id));
  const totalCommitteeFineAmount = userWiseDraws.reduce((acc, curr) => acc + Number(curr.fineAmountPaid), 0);
  const totalCommitteePaidAmount = userWiseDraws.reduce((acc, curr) => acc + Number(curr.userDrawAmountPaid), 0);

  const drawDates: any = await committeeReadRepository.findCommitteeDrawList(payload.committeeId);

  // Get full committee record to access committeeStatus
  const committeeRecord = await committeeReadRepository.findCommitteeDetails(payload.committeeId);
  if (!committeeRecord) {
    throw new NotFoundException({
      message: "Committee not found",
      description: "Committee not found",
    });
  }

  const analysisData: CommitteeAnalysis = {
    committeeId: committeeDetails.id,
    committeeName: committeeDetails.committeeName,
    committeeAmount: committeeDetails.committeeAmount,
    commissionMaxMember: committeeDetails.commissionMaxMember,
    committeeStatus: statusFromPrisma[committeeRecord.committeeStatus],
    noOfMonths: committeeDetails.noOfMonths,
    fineAmount: committeeDetails.fineAmount,
    extraDaysForFine: committeeDetails.extraDaysForFine,
    startCommitteeDate: committeeDetails.startCommitteeDate ?? null,
    analysis: {
      totalMembers: totalMembers,
      totalCommitteeAmount: committeeDetails.committeeAmount,
      totalCommitteePaidAmount: totalCommitteePaidAmount,
      totalCommitteeFineAmount: totalCommitteeFineAmount,
      noOfDrawsCompleted: userWiseDraws.length,
      totalDraws: drawDates?.length ?? 0,
    },
  };
  return analysisData;
}
//#endregion

//#region User Wise Draw Completed  
export async function updateUserWiseDrawCompleted(
  authUser: AuthenticatedUserPayload,
  payload: UserWiseDrawPaidBody
): Promise<UserWiseDrawRecord> {
  assertAdmin(authUser);

  const committeeDetails = await getCommitteeDetailsOrThrow(Number(payload.committeeId));
  if (committeeDetails.createdBy !== Number(authUser.id)) {
    throw new ForbiddenException({
      message: "You are not authorized to update draw amount",
      description: "You are not authorized to update draw amount",
    });
  }

  const isUserDrowCompleted: any = await committeeReadRepository.findUserWiseDrawByAndUserIdAndCommitteeId(Number(payload.committeeId), Number(payload.userId));
  if (isUserDrowCompleted && isUserDrowCompleted.isDrawCompleted) {
    throw new BadRequestException({
      message: "User Has Already Taken The Draw",
      description: "User Has Already Taken The Draw",
    });
  }


  const currentDrawTakenByUser = await committeeReadRepository.findComUserWiseDrawById(Number(payload.drawId), Number(payload.committeeId));
  if (currentDrawTakenByUser) {
    throw new BadRequestException({
      message: "this draw is already taken by other user",
      description: "this draw is already taken by other user",
    });
  }

  const userWiseDrawdata = await committeeReadRepository.findUserWiseDrawById(Number(payload.drawId), Number(payload.userId), Number(payload.committeeId));
  if (!userWiseDrawdata) {
    throw new NotFoundException({
      message: "First Mark Paid Payment",
      description: "First Mark Paid Payment",
    });
  }



  const record = await updateUserWiseDrawCompletedRepo(
    Number(payload.drawId), 
    Number(payload.userId), 
    Number(payload.committeeId),
    true // isDrawCompleted - marking draw as completed
  );
  return mapUserWiseDrawRecord(record);
}
//#endregion