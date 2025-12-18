import { FastifyReply, FastifyRequest } from "fastify";
import { fmt } from "../../config";
import {
    AuthenticatedUserPayload,
    ProfileQuerystring,
} from "../auth/auth.types";
import { addCommitteeMemberWithWorkflow, createCommitteeForAdmin, getAllCommitteeList, getCommitteeAnalysis, getCommitteeDrawListForUser, getCommitteeMemberList, getUserWiseDrawPaidAmount, updateDrawAmount, updateUserWiseDrawPaidAmount } from "./committee.services";
import { getDataFromRequestContext } from "../auth/helper";
import { CommitteeDrawQuerystring, CommitteeMemberQuerystring, UserWiseDrawPaidBody, AddCommitteeRequestBody, AddCommitteeMemberBody, UpdateDrawAmountBody, CommitteeAnalysisQuerystring } from "./committee.type";

export const GET_COMMITTEE_LIST = async (
    request: FastifyRequest<{ Querystring: ProfileQuerystring }>,
    reply: FastifyReply
): Promise<FastifyReply> => {
    const authUser: AuthenticatedUserPayload =
      getDataFromRequestContext<AuthenticatedUserPayload>(request, "data");

    const data = await getAllCommitteeList(authUser);

    return reply.status(200).send(
      fmt.formatResponse(
        data || [],
        "Committee List Fetched!"
      )
    );
};

export const ADD_COMMITTEE = async (
    request: FastifyRequest<{ Body: AddCommitteeRequestBody }>,
    reply: FastifyReply
): Promise<FastifyReply> => {
    const authUser = getDataFromRequestContext<AuthenticatedUserPayload>(
        request,
        "data"
    );
    
    // createCommitteeForAdmin uses transaction - if any error occurs, committee creation is rolled back
    // Errors are logged in createCommitteeForAdmin and handled by global error handler
    const data = await createCommitteeForAdmin(authUser, request.body);
    
    return reply.status(200).send(
        fmt.formatResponse(
            {
                ...data,
            },
            "Committee Added!"
        )
    );
};

export const ADD_COMMITTEE_MEMBER = async (
  request: FastifyRequest<{
    Body: AddCommitteeMemberBody
  }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const authUser = getDataFromRequestContext<AuthenticatedUserPayload>(
      request,
      "data"
  );
  
  // addCommitteeMemberWithWorkflow uses transaction - if any error occurs, all operations are rolled back
  // This includes: user creation (if new), committee member creation, draw creation, and status update
  // Errors are logged in addCommitteeMemberWithWorkflow and handled by global error handler
  const data = await addCommitteeMemberWithWorkflow(authUser, request.body);
  
  return reply.status(200).send(
      fmt.formatResponse(
          {
              ...data,
          },
          "Committee Member Added!"
      )
  );
};

export const GET_COMMITTEE_MEMBER = async (
  request: FastifyRequest<{
    Querystring: CommitteeMemberQuerystring
  }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const authUser = getDataFromRequestContext<AuthenticatedUserPayload>(
      request,
      "data"
  );
  const { committeeId } = request.query;
  const data = await getCommitteeMemberList(authUser, committeeId);
  return reply.status(200).send(  
      fmt.formatResponse(
        data || [],
          "Fetch Committee Member!"
      )
  );
};

export const GET_COMMITTEE_DRAW_LIST = async (
  request: FastifyRequest<{
    Querystring: CommitteeMemberQuerystring
  }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const authUser = getDataFromRequestContext<AuthenticatedUserPayload>(
    request,
    "data"
  );
  const { committeeId } = request.query;
  const data = await getCommitteeDrawListForUser(authUser, committeeId);
  return reply.status(200).send(
    fmt.formatResponse(
      data || [],
      "Fetch Committee Draw List!"
    )
  );
};


export const USER_WISE_DRAW_PAID_UPDATE = async (
  request: FastifyRequest<{
    Body: UserWiseDrawPaidBody
  }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const authUser = getDataFromRequestContext<AuthenticatedUserPayload>(
    request,
    "data"
  );
  
  const data = await updateUserWiseDrawPaidAmount(authUser, request.body);
  return reply.status(200).send(
    fmt.formatResponse(
      data || [],
      "Update User Wise Draw Paid!"
    )
  );
};


export const USER_WISE_DRAW_PAID_GET = async (
  request: FastifyRequest<{
    Querystring: CommitteeDrawQuerystring
  }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const authUser = getDataFromRequestContext<AuthenticatedUserPayload>(
    request,
    "data"
  );
  
  const data = await getUserWiseDrawPaidAmount(authUser, request.query);
  
  return reply.status(200).send(
    fmt.formatResponse(
      data || [],
      "Fetch User Wise Draw Paid!"
    )
  );
};

//#region Update Draw Amount
export const UPDATE_DRAW_AMOUNT = async (
  request: FastifyRequest<{
    Body: UpdateDrawAmountBody
  }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const authUser = getDataFromRequestContext<AuthenticatedUserPayload>(
    request,
    "data"
  );
  
  const data = await updateDrawAmount(authUser, request.body);
  return reply.status(200).send(
    fmt.formatResponse(
      data || [],
      "Update Draw Amount!"
    )
  );
};
//#endregion


//#region Get Committee Analysis
export const GET_COMMITTEE_ANALYSIS = async (
  request: FastifyRequest<{
    Querystring: CommitteeAnalysisQuerystring
  }>,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const authUser = getDataFromRequestContext<AuthenticatedUserPayload>(
    request,
    "data"
  );
  const data = await getCommitteeAnalysis(authUser, request.query);
  return reply.status(200).send(
    fmt.formatResponse(
      {
        ...data,
      },
      "Fetch Committee Analysis!"
    )
  );
};