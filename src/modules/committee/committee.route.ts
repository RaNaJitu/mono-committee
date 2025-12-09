import { API_METHODS } from "../../interfaces/api.interface";
import { IRouteOptions } from "../../interfaces/fatstify.interface";
import { preUserHandler } from "../../middleware";
import { validator } from "../../utils/validator";
import {
  ADD_COMMITTEE,
  ADD_COMMITTEE_MEMBER,
  GET_COMMITTEE_DRAW_LIST,
  GET_COMMITTEE_LIST,
  GET_COMMITTEE_MEMBER,
  USER_WISE_DRAW_PAID_GET,
  USER_WISE_DRAW_PAID_UPDATE,
} from "./committee.controller";
import {
  addCommitteeSchema,
  addCommitteeMemberSchema,
  getCommitteeDrawListSchema,
  getCommitteeListSchema,
  getCommitteeMemberSchema,
  updateUserWiseDrawPaidSchema,
  getUserWiseDrawPaidSchema,
} from "./committee.schema";
import {
  addCommitteeBodySchema,
  addCommitteeMemberBodySchema,
  committeeDrawQuerySchema,
  committeeListQuerySchema,
  committeeMemberQuerySchema,
  userWiseDrawPaidBodySchema,
  userWiseDrawPaidQuerySchema,
} from "./committee.validation";

const CommitteeRoutes: IRouteOptions<{
  Params: any;
  Body: any;
  Querystring: any;
}>[] = [
  {
    url: "/get",
    handler: GET_COMMITTEE_LIST,
    preHandler: [preUserHandler],
    schema: getCommitteeListSchema,
    validatorCompiler: validator({ queryString: committeeListQuerySchema }),
    method: API_METHODS.GET,
  },
  {
    url: "/add",
    handler: ADD_COMMITTEE,
    preHandler: [preUserHandler],
    schema: addCommitteeSchema,
    validatorCompiler: validator({ body: addCommitteeBodySchema }),
    method: API_METHODS.POST,
  },
  {
    url: "/member/add",
    handler: ADD_COMMITTEE_MEMBER,
    preHandler: [preUserHandler],
    schema: addCommitteeMemberSchema,
    validatorCompiler: validator({ body: addCommitteeMemberBodySchema }),
    method: API_METHODS.POST,
  },
  {
    url: "/member/get",
    handler: GET_COMMITTEE_MEMBER,
    preHandler: [preUserHandler],
    schema: getCommitteeMemberSchema,
    validatorCompiler: validator({ queryString: committeeMemberQuerySchema }),
    method: API_METHODS.GET,
  },
  {
    url: "/draw/get",
    handler: GET_COMMITTEE_DRAW_LIST,
    preHandler: [preUserHandler],
    schema: getCommitteeDrawListSchema,
    validatorCompiler: validator({ queryString: committeeDrawQuerySchema }),
    method: API_METHODS.GET,
  },
  {
    url: "/draw/user-wise-paid",
    handler: USER_WISE_DRAW_PAID_UPDATE,
    preHandler: [preUserHandler],
    schema: updateUserWiseDrawPaidSchema,
    validatorCompiler: validator({ body: userWiseDrawPaidBodySchema }),
    method: API_METHODS.PATCH,
  },
  {
    url: "/draw/user-wise-paid",
    handler: USER_WISE_DRAW_PAID_GET,
    preHandler: [preUserHandler],
    schema: getUserWiseDrawPaidSchema,
    validatorCompiler: validator({ queryString: userWiseDrawPaidQuerySchema }),
    method: API_METHODS.GET,
  },
];

export default CommitteeRoutes;
