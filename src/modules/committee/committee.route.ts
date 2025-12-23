import { API_METHODS } from "../../interfaces/api.interface";
import { IRouteOptions } from "../../interfaces/fatstify.interface";
import { preUserHandler } from "../../middleware";
import { validator } from "../../utils/validator";
import {
  ADD_COMMITTEE,
  ADD_COMMITTEE_MEMBER,
  GET_COMMITTEE_ANALYSIS,
  GET_COMMITTEE_LIST,
  GET_COMMITTEE_MEMBER,
} from "./committee.controller";
import {
  addCommitteeSchema,
  addCommitteeMemberSchema,
  getCommitteeListSchema,
  getCommitteeMemberSchema,
  committeeAnalysisSchema,
} from "./committee.schema";
import {
  addCommitteeBodySchema,
  addCommitteeMemberBodySchema,
  committeeAnalysisQuerySchema,
  committeeListQuerySchema,
  committeeMemberQuerySchema,
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
    url: "/analysis",
    handler: GET_COMMITTEE_ANALYSIS,
    preHandler: [preUserHandler],
    schema: committeeAnalysisSchema,
    validatorCompiler: validator({ queryString: committeeAnalysisQuerySchema }),
    method: API_METHODS.GET,
  },
];

export default CommitteeRoutes;
