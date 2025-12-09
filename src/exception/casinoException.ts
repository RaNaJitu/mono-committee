export interface CasinoErrorParams {
  error_message: string;
  status: number;
  StatusCode: number;
}

export class CasinoException extends Error {
  public error_message: string = "Something went wrong";
  public status: number = 1;
  public StatusCode: number = 401;

  constructor(params: CasinoErrorParams) {
    super(params.error_message);
    this.StatusCode = params.StatusCode;
    this.status = params.status;
    this.error_message = params.error_message;
  }
}

export class GapCasinoException extends Error{
  public balance;
  public status;

  constructor(params: {balance:number,status:string}) {
    super(params.status);
    this.status = params.status;
    this.balance = params.balance;
  }
}


export class PokerCasinoException extends Error {
  public balance: number;
  public status: string;

  constructor(params: { balance: number; status: string }) {
    super(params.status);
    this.name = "PokerCasinoException";
    this.status = params.status;
    this.balance = params.balance;

    // Restore prototype chain
    Object.setPrototypeOf(this, PokerCasinoException.prototype);
  }

  public toResponse() {
    return {
      status: 1,
      message: this.status,
      wallet: this.balance,
    };
  }
}

export class CasinoCommonException extends Error{
  public balance;
  public status;

  constructor(params: {balance:number,status:string}) {
    super(params.status);
    this.status = params.status;
    this.balance = params.balance;
  }
}