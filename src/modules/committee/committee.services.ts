import { CommitteeStatusEnum, Prisma } from "@prisma/client";
import { CommitteeStatus, UserRole } from "../../enum/constants";
import { BadRequestException } from "../../exception/badrequest.exception";
import { NotFoundException } from "../../exception/notfound.exception";
import baseLogger from "../../utils/logger/winston";
import {
  AuthenticatedUserPayload,
  RegisterUserRequestBody,
} from "../auth/auth.types";
import { RegisterUser } from "../auth/auth.services";
import {
  AddCommitteeMemberBody,
  AddCommitteePayload,
  AddCommitteeRequestBody,
  CommitteeAnalysis,
  CommitteeAnalysisQuerystring,
  CommitteeDetails,
  CommitteeMemberWithDraw,
  CommitteeSummary,
  CommitteeTypeEnum,
} from "./committee.type";
import {
  CommitteeDetailsRecord,
  CommitteeSelectRecord,
  committeeReadRepository,
  committeeSelectFields,
  findCommitteesByAdmin,
  findCommitteesForMember,
  findCommitteeMembersWithUser,
  runInTransaction,
} from "./committee.repository";


const statusToPrisma: Record<CommitteeStatus, CommitteeStatusEnum> = {
  [CommitteeStatus.INACTIVE]: CommitteeStatusEnum.INACTIVE,
  [CommitteeStatus.ACTIVE]: CommitteeStatusEnum.ACTIVE,
  [CommitteeStatus.COMPLETED]: CommitteeStatusEnum.COMPLETED,
};

const statusFromPrisma: Record<CommitteeStatusEnum, CommitteeStatus> = {
  [CommitteeStatusEnum.INACTIVE]: CommitteeStatus.INACTIVE,
  [CommitteeStatusEnum.ACTIVE]: CommitteeStatus.ACTIVE,
  [CommitteeStatusEnum.COMPLETED]: CommitteeStatus.COMPLETED,
};

// Map Prisma CommitteeTypeEnum to TypeScript CommitteeTypeEnum
// Prisma enum values match TypeScript enum string values
const committeeTypeFromPrisma = (prismaType: string): CommitteeTypeEnum => {
  return prismaType as CommitteeTypeEnum;
};

const ADMIN_ONLY_ERROR = {
  message: "You are not authorized to perform this action",
  description: "Only committee admins can execute this operation",
};

const toNumber = (value: Prisma.Decimal | number | null | undefined): number =>
  value === null || value === undefined ? 0 : Number(value);

const toOptionalNumber = (
  value: Prisma.Decimal | number | null | undefined
): number | undefined =>
  value === null || value === undefined ? undefined : Number(value);

const mapCommitteeSummary = (
  record: CommitteeSelectRecord
): CommitteeSummary => ({
  id: record.id,
  committeeName: record.committeeName,
  committeeAmount: Number(record.committeeAmount),
  commissionMaxMember: record.commissionMaxMember,
  committeeStatus: statusFromPrisma[record.committeeStatus],
  noOfMonths: record.noOfMonths,
  createdAt: record.createdAt,
  fineAmount: toOptionalNumber(record.fineAmount),
  extraDaysForFine: record.extraDaysForFine ?? undefined,
  startCommitteeDate: record.startCommitteeDate ?? undefined,
  committeeType: committeeTypeFromPrisma(record.committeeType as string),
  fineStartDate: record.fineStartDate ?? null,
  lotteryAmount: Number(record.lotteryAmount),
});

const mapCommitteeDetails = (
  record: CommitteeDetailsRecord
): CommitteeDetails => ({
  id: record.id,
  committeeName: record.committeeName,
  committeeAmount: Number(record.committeeAmount),
  commissionMaxMember: record.commissionMaxMember,
  noOfMonths: record.noOfMonths,
  createdBy: record.createdBy,
  fineAmount: toNumber(record.fineAmount),
  extraDaysForFine: record.extraDaysForFine ?? 0,
  startCommitteeDate: record.startCommitteeDate ?? null,
});

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

function buildRegisterPayload(
  body: AddCommitteeMemberBody
): RegisterUserRequestBody {
  return {
    email: body.email ?? `${body.phoneNo}@committee.local`,
    phoneNo: body.phoneNo,
    password: body.password ?? "admin123",
    role: UserRole.USER,
    name: body.name ?? body.phoneNo,
    createdBy: body.createdBy,
  };
}

function buildDrawSchedule(
  details: CommitteeDetails,
  committeeId: number
): Prisma.CommitteeDrawCreateManyInput[] {
  const payload: Prisma.CommitteeDrawCreateManyInput[] = [];
  const baseDate = details.startCommitteeDate
    ? new Date(details.startCommitteeDate)
    : new Date();

  for (let index = 0; index < details.noOfMonths; index += 1) {
    const drawDate = new Date(baseDate);
    drawDate.setMonth(baseDate.getMonth() + index);
    drawDate.setHours(19, 0, 0, 0);

    payload.push({
      committeeId,
      committeeDrawAmount: 0,
      committeeDrawPaidAmount: 0,
      committeeDrawMinAmount: Number(
        (details.committeeAmount / details.commissionMaxMember).toFixed(2)
      ),
      committeeDrawDate: drawDate,
      committeeDrawTime: drawDate,
    });
  }

  return payload;
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

export async function getAllCommitteeList(
  authUser: AuthenticatedUserPayload
): Promise<CommitteeSummary[]> {
  const committees =
    authUser.role === UserRole.ADMIN
      ? await findCommitteesByAdmin(Number(authUser.id))
      : await findCommitteesForMember(Number(authUser.id));

  return committees.map(mapCommitteeSummary);
}

export async function createCommitteeForAdmin(
  authUser: AuthenticatedUserPayload,
  body: AddCommitteeRequestBody
): Promise<CommitteeSummary> {
  assertAdmin(authUser);
  if (body.committeeType === CommitteeTypeEnum.LOTTERY && (!body.lotteryAmount || body.lotteryAmount <= 0)) {
    throw new BadRequestException({
      message: "Lottery amount is required",
      description: "Lottery amount is required",
    });
  }
  try {
    // Calculate end committee date from start date and number of months
    // Zod validation ensures startCommitteeDate is already a Date object
    let endCommitteeDate: Date | null = null;
    if (body.startCommitteeDate) {
      endCommitteeDate = new Date(body.startCommitteeDate);
      endCommitteeDate.setMonth(endCommitteeDate.getMonth() + body.noOfMonths);
      endCommitteeDate.setHours(19, 0, 0, 0);
    } 
    baseLogger.info("endCommitteeDate", endCommitteeDate, body);
    // Use transaction to ensure atomicity - if any error occurs, committee creation is rolled back
    return runInTransaction(
      async ({ tx }) => {
        const payload: AddCommitteePayload = {
          committeeName: body.committeeName,
          committeeAmount: body.committeeAmount,
          commissionMaxMember: body.commissionMaxMember,
          noOfMonths: body.noOfMonths,
          createdBy: Number(authUser.id),
          updatedBy: Number(authUser.id),
          fineAmount: body.fineAmount,
          extraDaysForFine: body.extraDaysForFine,
          startCommitteeDate: body.startCommitteeDate,
          endCommitteeDate: endCommitteeDate,
          committeeType: body.committeeType,
          fineStartDate: body.fineStartDate,
        };

        // Create committee using transaction client
        const record = await tx.committee.create({
          data: payload,
          select: committeeSelectFields,
        });

        return mapCommitteeSummary(record);
      },
      {
        timeout: 5000,
        maxWait: 5000,
        isolationLevel: 'ReadCommitted',
      }
    );
  } catch (error) {
    // Log error for debugging
    baseLogger.error("Committee creation failed", {
      error: error instanceof Error ? error.message : String(error),
      committeeName: body.committeeName,
      createdBy: authUser.id,
    });
    
    // Re-throw to let the global error handler process it
    throw error;
  }
}

export async function addCommitteeMemberWithWorkflow(
  authUser: AuthenticatedUserPayload,
  body: AddCommitteeMemberBody
) {
  assertAdmin(authUser);
  const committeeId = ensureCommitteeIdProvided(body.committeeId);

  try {
    // Use transaction to ensure atomicity - if any error occurs, all operations are rolled back
    // This includes: user creation (if new), committee member creation, draw creation, and status update
    return runInTransaction(async ({ repo, tx }) => {
      // Check if user exists - use transaction client to prevent race conditions
      const existingUser = await tx.user.findUnique({
        where: { phoneNo: body.phoneNo },
      });
      body.createdBy = authUser.id;
      // Create user if doesn't exist - uses transaction client
      const user =
        existingUser ?? (await RegisterUser(tx, buildRegisterPayload(body)));

      // Check if user is already a member - uses transaction client
      const alreadyMember = await repo.findCommitteeMember(committeeId, user.id);
      if (alreadyMember) {
        throw new BadRequestException({
          message: "User already added to committee Member",
          description: "User already added to committee Member",
        });
      }

      // Create committee member - uses transaction client
      await repo.createCommitteeMember({ committeeId, userId: user.id });

      // Get committee details - uses transaction client
      const committeeRecord = await repo.findCommitteeDetails(committeeId);
      if (!committeeRecord) {
        throw new NotFoundException({
          message: "Committee not found",
          description: "Committee not found",
        });
      }

      const committeeDetails = mapCommitteeDetails(committeeRecord);
      
      // Get current member count - uses transaction client
      const committeeMembers = await repo.findCommitteeMembers(committeeId);

      // Validate member count before proceeding
      if (committeeDetails.commissionMaxMember < committeeMembers.length) {
        throw new BadRequestException({
          message: "Max members reached for this committee",
          description: "Max members reached for this committee",
        });
      }

      // If max members reached, create draws and activate committee - all in transaction
      if (committeeDetails.commissionMaxMember === committeeMembers.length) {
        const drawPayload = buildDrawSchedule(committeeDetails, committeeId);
        baseLogger.info(
          "Generating %d draws for committee %d",
          drawPayload.length,
          committeeId
        );
        
        // Create draws - uses transaction client
        await repo.createCommitteeDraws(drawPayload);
        
        // Update committee status - uses transaction client
        await repo.updateCommitteeStatus(
          committeeId,
          statusToPrisma[CommitteeStatus.ACTIVE]
        );
      }

      return user;
    }, { 
      timeout: 10_000,
      maxWait: 10_000,
      isolationLevel: 'ReadCommitted',
    });
  } catch (error) {
    // Log error for debugging
    baseLogger.error("Committee member addition failed", {
      error: error instanceof Error ? error.message : String(error),
      phoneNo: body.phoneNo,
      committeeId: body.committeeId,
      createdBy: authUser.id,
    });
    
    // Re-throw to let the global error handler process it
    // Transaction will automatically rollback
    throw error;
  }
}

export async function getCommitteeMemberList(
  _authUser: AuthenticatedUserPayload,
  committeeId?: number
): Promise<CommitteeMemberWithDraw[]> {
  const id = ensureCommitteeIdProvided(committeeId);
  const members = await findCommitteeMembersWithUser(id);

  return members.map((cm) => {
    const draws = cm.user.UserWiseDraw;
    const totalUserDrawAmountPaid = draws.reduce(
      (sum, d) => sum + Number(d.userDrawAmountPaid ?? 0),
      0,
    );
    const totalFineAmountPaid = draws.reduce(
      (sum, d) => sum + Number(d.fineAmountPaid ?? 0),
      0,
    );
    const isAnyDrawCompleted = draws.some((d) => d.isUserDrawCompleted === true);

    return {
      id: cm.id,
      userId: cm.userId,
      committeeId: cm.committeeId,
      createdAt: cm.createdAt,
      user: {
        id: cm.user.id,
        name: cm.user.name,
        phoneNo: cm.user.phoneNo,
        email: cm.user.email,
        role: cm.user.role,
        userDrawAmountPaid: totalUserDrawAmountPaid,
        fineAmountPaid: totalFineAmountPaid,
        isUserDrawCompleted: isAnyDrawCompleted,
      },
    };
  });
}


//#region Get Committee Analysis
export async function getCommitteeAnalysis(
  authUser: AuthenticatedUserPayload,
  payload: CommitteeAnalysisQuerystring
): Promise<CommitteeAnalysis> { 

  const committeeDetails = await getCommitteeDetailsOrThrow(payload.committeeId);

  const totalMembers = await committeeReadRepository.countCommitteeMembers(committeeDetails.id);
  const userWiseDraws = await committeeReadRepository.findUserWiseDrawListByCommitteeIdAndUserId(payload.committeeId, Number(authUser.id));
  // const userWiseDraws =await committeeReadRepository.findUserWiseDrawById(payload.drawId, Number(authUser.id), payload.committeeId);
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

