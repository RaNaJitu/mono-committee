import { CommitteeStatus } from "../../enum/constants";

export interface CommitteeMemberQuerystring {
  committeeId: number;
}


export interface AddCommitteeRequestBody {
  committeeName: string;
  committeeAmount: number;
  commissionMaxMember: number;
  noOfMonths: number;
  startCommitteeDate: Date;
  fineAmount?: number;
  extraDaysForFine?: number;
  endCommitteeDate?: Date | null;
}

export interface AddCommitteeMemberBody {
  committeeId: number;
  name: string;
  phoneNo: string;
  password?: string;
  email?: string;
}

export enum CommitteeTypeEnum {
  COUNTER = "COUNTER",
  NORMAL = "NORMAL",
  LOTTERY = "LOTTERY",
}

export interface CommitteeSummary {
  id: number;
  committeeName: string;
  committeeAmount: number;
  commissionMaxMember: number;
  committeeStatus: CommitteeStatus;
  noOfMonths: number;
  createdAt: Date;
  fineAmount?: number;
  extraDaysForFine?: number;
  startCommitteeDate?: Date | null;
  committeeType: CommitteeTypeEnum;
}

export interface CommitteeMemberWithDraw {
  id: number;
  userId: number;
  committeeId: number;
  createdAt: Date;
  user: {
    id: number;
    name: string;
    phoneNo: string;
    email: string;
    role: string;
    userDrawAmountPaid: number;
    fineAmountPaid: number;
  };
}

export interface CommitteeDrawRecord {
  id: number;
  committeeId: number;
  committeeDrawAmount: number;
  committeeDrawPaidAmount: number;
  committeeDrawMinAmount: number;
  committeeDrawDate: Date;
  committeeDrawTime: Date;
}

export interface AddCommitteePayload {
  committeeName: string;
  committeeAmount: number;
  commissionMaxMember: number;
  noOfMonths: number;
  createdBy: number;
  updatedBy: number;
  startCommitteeDate: Date | null;
  fineAmount?: number;
  extraDaysForFine?: number;
  endCommitteeDate?: Date | null;
}

export interface CommitteeMemberRecord {
  id: number;
  userId: number;
  committeeId: number;
  createdAt: Date;
}

export interface CommitteeDetails {
  id: number;
  committeeName: string;
  committeeAmount: number;
  commissionMaxMember: number;
  noOfMonths: number;
  createdBy: number;
  fineAmount: number;
  extraDaysForFine: number;
  startCommitteeDate?: Date | null;
}

export interface AddCommitteeMemberInput {
  committeeId: number;
  userId: number;
}

export interface UserWiseDrawRecord {
  id: number;
  committeeId: number;
  drawId: number;
  userId: number;
  isDrawCompleted: boolean;
  user: {
    id: number;
    name: string;
    phoneNo: string;
    email: string;
    role: string | import("../../enum/constants").UserRole;
    userDrawAmountPaid: number;
    fineAmountPaid: number;
  };
  createdAt: Date;
  updatedAt: Date;
}


export interface CommitteeAnalysisQuerystring {
  committeeId: number;
}

export interface CommitteeAnalysis { 
  // id: number;
  committeeId: number;
  committeeName: string;
  committeeAmount: number;
  commissionMaxMember: number;
  committeeStatus: CommitteeStatus;
  noOfMonths: number;
  fineAmount: number;
  extraDaysForFine: number;
  startCommitteeDate: Date | null;
  analysis: {
    totalMembers: number;
    totalCommitteeAmount: number;
    totalCommitteePaidAmount: number;
    totalCommitteeFineAmount: number;
    noOfDrawsCompleted: number;
    totalDraws: number;
  };
}
