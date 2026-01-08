import { FastifyReply, FastifyRequest } from "fastify";
import { fmt } from "../../config";
import { AuthenticatedUserPayload } from "../auth/auth.types";
import {
    getCommitteeDrawListForUser,
    getLotteryRandomUser,
    getUserWiseDrawPaidAmount,
    updateDrawAmount,
    updateUserWiseDrawCompleted,
    updateUserWiseDrawPaidAmount,
} from "./draw.services";
import { getDataFromRequestContext } from "../auth/helper";
import {
    CommitteeDrawQuerystring,
    CommitteeMemberQuerystring,
    UserWiseDrawPaidBody,
    UpdateDrawAmountBody,
    UserWiseDrawCompletedBody,
} from "./draw.type";

//#region Get Committee Draw List
export const GET_COMMITTEE_DRAW_LIST = async (
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
    const data = await getCommitteeDrawListForUser(authUser, committeeId);
    return reply
        .status(200)
        .send(fmt.formatResponse(data || [], "Fetch Committee Draw List!"));
};
//#endregion

//#region Update User Wise Draw Paid
export const USER_WISE_DRAW_PAID_UPDATE = async (
    request: FastifyRequest<{
        Body: UserWiseDrawPaidBody;
    }>,
    reply: FastifyReply
): Promise<FastifyReply> => {
    const authUser = getDataFromRequestContext<AuthenticatedUserPayload>(
        request,
        "data"
    );

    const data = await updateUserWiseDrawPaidAmount(authUser, request.body);
    return reply
        .status(200)
        .send(fmt.formatResponse(data || [], "Update User Wise Draw Paid!"));
};
//#endregion

//#region Get User Wise Draw Paid
export const USER_WISE_DRAW_PAID_GET = async (
    request: FastifyRequest<{
        Querystring: CommitteeDrawQuerystring;
    }>,
    reply: FastifyReply
): Promise<FastifyReply> => {
    const authUser = getDataFromRequestContext<AuthenticatedUserPayload>(
        request,
        "data"
    );

    const data = await getUserWiseDrawPaidAmount(authUser, request.query);

    return reply
        .status(200)
        .send(fmt.formatResponse(data || [], "Fetch User Wise Draw Paid!"));
};
//#endregion

//#region Update Draw Amount
export const UPDATE_DRAW_AMOUNT = async (
    request: FastifyRequest<{
        Body: UpdateDrawAmountBody;
    }>,
    reply: FastifyReply
): Promise<FastifyReply> => {
    const authUser = getDataFromRequestContext<AuthenticatedUserPayload>(
        request,
        "data"
    );

    const data = await updateDrawAmount(authUser, request.body);
    return reply
        .status(200)
        .send(fmt.formatResponse(data || [], "Update Draw Amount!"));
};
//#endregion

//#region User Wise Draw Completed
export const USER_WISE_DRAW_COMPLETED = async (
    request: FastifyRequest<{
        Body: UserWiseDrawCompletedBody;
    }>,
    reply: FastifyReply
): Promise<FastifyReply> => {
    const authUser = getDataFromRequestContext<AuthenticatedUserPayload>(
        request,
        "data"
    );
    const data = await updateUserWiseDrawCompleted(authUser, request.body);
    return reply
        .status(200)
        .send(
            fmt.formatResponse(data || [], "Update User Wise Draw Completed!")
        );
};
//#endregion


//#region Get Lottery Random User
export const GET_LOTTERY_RANDOM_USER = async (
    request: FastifyRequest<{
        Querystring: { committeeId: number };
    }>,
    reply: FastifyReply
): Promise<FastifyReply> => {
    const { committeeId } = request.query;
    const data = await getLotteryRandomUser(committeeId);
    return reply
        .status(200)
        .send(fmt.formatResponse(data || [], "Get Lottery Random User!"));
};
//#endregion