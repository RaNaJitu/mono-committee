import { API_METHODS } from "../../interfaces/api.interface";
import { IRouteOptions } from "../../interfaces/fatstify.interface";
import {
  preUserHandler,
} from "../../middleware";
import { authRateLimitMiddleware, registerRateLimitMiddleware } from "../../middleware/rate-limit.middleware";
import { validator } from "../../utils/validator";

import {
  LOGIN,
  REGISTER_USER,
  LOGOUT,
  GET_CURRENT_USER_PROFILE,
  GET_USER_LIST_CREATED_BY_ADMIN,
} from "../auth/auth.controller";
import {
  getProfileSchema,
  getUserListSchema,
  loginSchema,
  logoutSchema,
  registerUser,
} from "./auth.schema";
import {
  loginBodySchema,
  profileQuerySchema,
  registerUserBodySchema,
} from "./auth.validation";
const AuthRoutes: IRouteOptions<{
  Params: any;
  Body: any;
  Querystring: any;
}>[] = [
  {
    url: "/login",
    handler: LOGIN,
    schema: loginSchema,
    validatorCompiler: validator({ body: loginBodySchema }),
    method: API_METHODS.POST,
    preHandler: [authRateLimitMiddleware],
  },
  {
    url: "/profile/me",
    preHandler: [preUserHandler],
    handler: GET_CURRENT_USER_PROFILE,
    schema: getProfileSchema,
    validatorCompiler: validator({ queryString: profileQuerySchema }),
    method: API_METHODS.GET,
  },
  {
    url: "/register",
    handler: REGISTER_USER,
    // preHandler: [preUserHandler],
    schema: registerUser,
    validatorCompiler: validator({ body: registerUserBodySchema }),
    method: API_METHODS.POST,
    preHandler: [registerRateLimitMiddleware],
  },
  {
    url: "/logout",
    handler: LOGOUT,
    preHandler: [preUserHandler],
    schema: logoutSchema,
    method: API_METHODS.POST,
  },
  {
    url: "/user-list",
    preHandler: [preUserHandler],
    handler: GET_USER_LIST_CREATED_BY_ADMIN,
    schema: getUserListSchema,
    validatorCompiler: validator({ queryString: profileQuerySchema }),
    method: API_METHODS.GET,
  },
];

export default AuthRoutes;
