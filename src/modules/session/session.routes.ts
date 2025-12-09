import { SessionController } from './session.controller';
import { API_METHODS } from "../../interfaces/api.interface";
import { IRouteOptions } from "../../interfaces/fatstify.interface";
import { preUserHandler } from "../../middleware";
import { validator } from "../../utils/validator";
import {
  createSessionSchema,
  loginActivitiesSchema,
  logoutSessionSchema,
} from "./session.schema";
import {
  createSessionBodySchema,
  loginActivitiesQuerySchema,
  logoutBodySchema,
} from "./session.validation";

const sessionRoutes: IRouteOptions<{
    Params: any;
    Body: any;
    Querystring: any;
  }>[] = [
    {
      url: "/login",
      preHandler: [preUserHandler],
      handler: SessionController.createSession,
      schema: createSessionSchema,
      validatorCompiler: validator({ body: createSessionBodySchema }),
      method: API_METHODS.POST,
    },
    {
      url: "/logout",
      preHandler: [preUserHandler],
      handler: SessionController.logout,
      schema: logoutSessionSchema,
      validatorCompiler: validator({ body: logoutBodySchema }),
      method: API_METHODS.POST,
    },
    {
      url: "/login-activities",
      preHandler: [preUserHandler],
      handler: SessionController.loginActivites,
      schema: loginActivitiesSchema,
      validatorCompiler: validator({ queryString: loginActivitiesQuerySchema }),
      method: API_METHODS.GET,
    },
  ];
  
  export default sessionRoutes;