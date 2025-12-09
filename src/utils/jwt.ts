import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { config, fmt } from "../config";
import { UnauthorizedException } from "../exception/unauthorized.exception";
import { JWT_CONFIG } from "../constants/security.constants";

interface ISignJwt {
  data: object;
  expiresIn?: string;
}

/**
 * Signs a JWT token with the provided data
 * 
 * @param params - JWT signing parameters
 * @param params.data - Payload data to encode in token
 * @param params.expiresIn - Token expiration time (defaults to JWT_CONFIG.DEFAULT_EXPIRY)
 * @returns Signed JWT token string
 * 
 * @example
 * ```typescript
 * const token = signJwt({ 
 *   data: { userId: 1, role: 'USER' },
 *   expiresIn: '1h'
 * });
 * ```
 */
export function signJwt(params: ISignJwt): string {
  const { data, expiresIn = JWT_CONFIG.DEFAULT_EXPIRY } = params;
  const options: SignOptions = { expiresIn };

  return jwt.sign({ data }, config.jwt_secret, options);
}

/**
 * Verifies and decodes a JWT token
 * 
 * @param token - JWT token string to verify
 * @returns Decoded JWT payload
 * @throws {UnauthorizedException} If token is invalid or expired
 * 
 * @example
 * ```typescript
 * const payload = verifyJwt(token);
 * const userId = payload.data.id;
 * ```
 */
export function verifyJwt(token: string): JwtPayload {
  try {
    return jwt.verify(token, config.jwt_secret) as JwtPayload;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.name : 'Unknown error';
    throw new UnauthorizedException(
      fmt.formatError({
        message: "Authentication Error!",
        description: errorMessage,
      })
    );
  }
}


export const parseJwt = (token: string): any => {
  try {
    const decoded = jwt.decode(token, { complete: true });
    return decoded;
  } catch {
    return null;
  }
};
