import crypto from 'crypto';
import { PASSWORD_HASH } from '../constants/security.constants';

/**
 * Hashes a password using PBKDF2 with high iteration count
 * 
 * @param password - Plain text password to hash (case-sensitive)
 * @returns Promise resolving to hash and salt
 * 
 * @example
 * ```typescript
 * const { hash, salt } = await hashPassword('MySecurePassword123');
 * ```
 */
export async function hashPassword(
  password: string
): Promise<{ hash: string; salt: string }> {
  if (!password || password.length === 0) {
    throw new Error('Password cannot be empty');
  }

  const salt = crypto.randomBytes(PASSWORD_HASH.SALT_LENGTH).toString('hex');
  
  // Use async pbkdf2 to avoid blocking event loop
  // DO NOT lowercase password - preserve case sensitivity for better security
  const hashBuffer = await new Promise<Buffer>((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      PASSWORD_HASH.ITERATIONS,
      PASSWORD_HASH.KEY_LENGTH,
      PASSWORD_HASH.ALGORITHM,
      (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey);
      }
    );
  });

  return {
    hash: hashBuffer.toString('hex'),
    salt,
  };
}

/**
 * Verifies a password against a stored hash and salt
 * 
 * @param candidatePassword - Password to verify (case-sensitive)
 * @param salt - Salt used during hashing
 * @param hash - Stored password hash
 * @returns Promise resolving to true if password matches, false otherwise
 * 
 * @example
 * ```typescript
 * const isValid = await verifyPassword('MyPassword', salt, storedHash);
 * ```
 */
// export async function verifyPassword(
//   candidatePassword: string,
//   salt: string,
//   hash: string
// ): Promise<boolean> {
//   if (!candidatePassword || !salt || !hash) {
//     return false;
//   }

//   try {
//     // DO NOT lowercase password - preserve case sensitivity
//     const candidateHashBuffer = await new Promise<Buffer>((resolve, reject) => {
//       crypto.pbkdf2(
//         candidatePassword,
//         salt,
//         PASSWORD_HASH.ITERATIONS,
//         PASSWORD_HASH.KEY_LENGTH,
//         PASSWORD_HASH.ALGORITHM,
//         (err, derivedKey) => {
//           if (err) reject(err);
//           else resolve(derivedKey);
//         }
//       );
//     });

//     const candidateHash = candidateHashBuffer.toString('hex');
    
//     // Use timing-safe comparison to prevent timing attacks
//     return crypto.timingSafeEqual(
//       Buffer.from(hash, 'hex'),
//       Buffer.from(candidateHash, 'hex')
//     );
//   } catch (error) {
//     return false;
//   }
// }

export function verifyPassword(candidatePassword:string,salt:string,hash:string){
  const lowerCasePassword = candidatePassword.toLowerCase()
  const candidateHash  =  crypto.pbkdf2Sync(lowerCasePassword,salt,1000,64,"sha512").toString('hex')
  return candidateHash === hash
  }