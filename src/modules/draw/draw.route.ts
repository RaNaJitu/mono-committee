import { API_METHODS } from "../../interfaces/api.interface";
import { IRouteOptions } from "../../interfaces/fatstify.interface";
import { preUserHandler } from "../../middleware";
import { validator } from "../../utils/validator";
import {
  GET_COMMITTEE_DRAW_LIST,
  GET_LOTTERY_RANDOM_USER,
  UPDATE_DRAW_AMOUNT,
  UPDATE_LOTTERY_RESULT,
  USER_WISE_DRAW_COMPLETED,
  USER_WISE_DRAW_PAID_GET,
  USER_WISE_DRAW_PAID_UPDATE,
} from "./draw.controller";
import {
  getCommitteeDrawListSchema,
  updateUserWiseDrawPaidSchema,
  getUserWiseDrawPaidSchema,
  updateDrawAmountSchema,
  userWiseDrawCompletedSchema,
  getLotteryRandomUserSchema,
} from "./draw.schema";
import {
  committeeDrawQuerySchema,
  getLotteryRandomUserQuerySchema,
  updateDrawAmountBodySchema,
  userWiseDrawCompletedBodySchema,
  userWiseDrawPaidBodySchema,
  userWiseDrawPaidQuerySchema,
} from "./draw.validation";

const CommitteeRoutes: IRouteOptions<{
  Params: any;
  Body: any;
  Querystring: any;
}>[] = [
  {
    url: "/get",
    handler: GET_COMMITTEE_DRAW_LIST,
    preHandler: [preUserHandler],
    schema: getCommitteeDrawListSchema,
    validatorCompiler: validator({ queryString: committeeDrawQuerySchema }),
    method: API_METHODS.GET,
  },
  {
    url: "/user-wise-paid",
    handler: USER_WISE_DRAW_PAID_UPDATE,
    preHandler: [preUserHandler],
    schema: updateUserWiseDrawPaidSchema,
    validatorCompiler: validator({ body: userWiseDrawPaidBodySchema }),
    method: API_METHODS.PATCH,
  },
  {
    url: "/user-wise-paid",
    handler: USER_WISE_DRAW_PAID_GET,
    preHandler: [preUserHandler],
    schema: getUserWiseDrawPaidSchema,
    validatorCompiler: validator({ queryString: userWiseDrawPaidQuerySchema }),
    method: API_METHODS.GET,
  },
  {
    url: "/amount-update",
    handler: UPDATE_DRAW_AMOUNT,
    preHandler: [preUserHandler],
    schema: updateDrawAmountSchema,
    validatorCompiler: validator({ body: updateDrawAmountBodySchema }),
    method: API_METHODS.PATCH,
  },
  {
    url: "/user-wise-completed",
    handler: USER_WISE_DRAW_COMPLETED,
    preHandler: [preUserHandler],
    schema: userWiseDrawCompletedSchema,
    validatorCompiler: validator({ body: userWiseDrawCompletedBodySchema }),
    method: API_METHODS.PATCH,
  },
  {
    url: "/lottery-random-user",
    handler: GET_LOTTERY_RANDOM_USER,
    preHandler: [preUserHandler],
    schema: getLotteryRandomUserSchema,
    validatorCompiler: validator({ queryString: getLotteryRandomUserQuerySchema }),
    method: API_METHODS.GET,
    },
    {
      url: "/lottery-result-update",
      handler: UPDATE_LOTTERY_RESULT,
      preHandler: [preUserHandler],
      schema: userWiseDrawPaidBodySchema,
      validatorCompiler: validator({ body: userWiseDrawPaidBodySchema }),
      method: API_METHODS.PATCH,
    },
];

export default CommitteeRoutes;
