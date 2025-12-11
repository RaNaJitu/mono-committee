import { SwaggerOptions } from "@fastify/swagger";
import { FastifySwaggerUiOptions } from "@fastify/swagger-ui";
import { loginUserBody } from "../modules/auth/auth.schema";
// import { getWhiteLabelByIdResponse } from "../modules/whitelabel/whiteLabel.schema";
// import { meQuery } from "../modules/transaction/statement.schema";

export const swaggerConfig: SwaggerOptions = {
  swagger: {
    info: {
      title: "Committee Management API",
      description: "API documentation for Committee Management System - User authentication, committee management, and session tracking",
      version: "1.0.0",
    },
    externalDocs: {
      url: "https://swagger.io",
      description: "Find more info here",
    },
    consumes: ["application/json"],
    produces: ["application/json"],
    schemes: ['http', 'https'],
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: "Enter your bearer token in the format **Bearer &lt;token&gt;**"
      }
    },
    definitions: {
      UserAuth: loginUserBody,
      // userAuth: registerUserBodySchema,
    }
  },
};

export const swaggerUiConfig: FastifySwaggerUiOptions = {
  routePrefix: "/swagger/docs",
  uiConfig: {
    docExpansion: "list", // Show endpoints in list format
    deepLinking: true, // Enable deep linking to specific endpoints
    displayRequestDuration: true, // Show request duration
    filter: true, // Enable filter/search
    showExtensions: true, // Show extensions
    showCommonExtensions: true, // Show common extensions
  },
  staticCSP: false, // Disable CSP transformation - let Helmet handle it
  uiHooks: {
    onRequest: function (_request, _reply, next) { next() },
    preHandler: function (_request, _reply, next) { next() }
  }
}
