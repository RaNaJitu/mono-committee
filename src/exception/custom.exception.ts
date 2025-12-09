import { CustomErrorParams } from "../interfaces/error.interface";

export class CustomException extends Error {
  public status: number = 500;
  public message: string = "Something went wrong";
  public code: string = "E500";
  constructor(params: CustomErrorParams) {
    super(params.message);
    this.status = params.status;
    this.code = params.code;
    this.message = params.message;
  }
}

// export class AppError extends Error {
//   constructor(message: any, { status = 500, code = "INTERNAL_ERROR", details = null } = {}) {
//     super(message);
//     this.name = this.constructor.name;
//     this.status = status;
//     this.code = code;
//     this.details = details
//   }
// }

// export class BadRequestError extends AppError {
//   constructor(message = 'Bed Request', details) {
//     super(message, {status : 400, code: 'Bed Request', details})
//   }
// }

// export class Unauthorized extends AppError{
//   constructor(message = 'Unauthorized') {
//     super(message, {status: 401, code: 'UNAUTHORIZED'})
//   }
// }
