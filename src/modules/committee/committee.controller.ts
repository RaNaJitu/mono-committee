import { FastifyReply, FastifyRequest } from "fastify";
import { fmt } from "../../config";
import {
    AuthenticatedUserPayload,
    ProfileQuerystring,
} from "../auth/auth.types";
import {
    addCommitteeMemberWithWorkflow,
    createCommitteeForAdmin,
    getAllCommitteeList,
    getCommitteeAnalysis,
    getCommitteeMemberList,
} from "./committee.services";
import { getDataFromRequestContext } from "../auth/helper";
import {
    CommitteeMemberQuerystring,
    AddCommitteeRequestBody,
    AddCommitteeMemberBody,
    CommitteeAnalysisQuerystring,
} from "./committee.type";

//#region Get Committee List
export const GET_COMMITTEE_LIST = async (
    request: FastifyRequest<{ Querystring: ProfileQuerystring }>,
    reply: FastifyReply
): Promise<FastifyReply> => {
    const authUser: AuthenticatedUserPayload =
        getDataFromRequestContext<AuthenticatedUserPayload>(request, "data");

    const data = await getAllCommitteeList(authUser);

    return reply
        .status(200)
        .send(fmt.formatResponse(data || [], "Committee List Fetched!"));
};
//#endregion

//#region Add Committee
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
//#endregion

//#region Add Committee Member
export const ADD_COMMITTEE_MEMBER = async (
    request: FastifyRequest<{
        Body: AddCommitteeMemberBody;
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
//#endregion

//#region Get Committee Member
export const GET_COMMITTEE_MEMBER = async (
    request: FastifyRequest<{
        Querystring: CommitteeMemberQuerystring;
    }>,
    reply: FastifyReply
): Promise<FastifyReply> => {
    const authUser = getDataFromRequestContext<AuthenticatedUserPayload>(
        request,
        "data"
    );
    const { committeeId } = request.query;
    const data = await getCommitteeMemberList(authUser, committeeId);
    return reply
        .status(200)
        .send(fmt.formatResponse(data || [], "Fetch Committee Member!"));
};
//#endregion

//#region Get Committee Analysis
export const GET_COMMITTEE_ANALYSIS = async (
    request: FastifyRequest<{
        Querystring: CommitteeAnalysisQuerystring;
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
//#endregion