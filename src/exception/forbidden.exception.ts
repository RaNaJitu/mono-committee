import { ErrorParams } from "../interfaces/error.interface";
import { HttpException } from "./http.exception";

export class ForbiddenException extends HttpException {
  constructor(params: Pick<ErrorParams, "data" | "message" | "description">) {
    super({
      status: 403,
      code: "E403",
      message: params.message,
      data: params.data,
      description: params.description,
    });
  }
}
