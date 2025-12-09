
import fs from "fs";
import path from "path";
import { MultipartFile } from "@fastify/multipart";
import { FastifyReply, FastifyRequest } from "fastify";
import { UnauthorizedException } from "../exception/unauthorized.exception";
import { fmt } from "../config";
import { verifyJwt } from "../utils/jwt";
// import prisma from "../utils/prisma";
import { prisma } from "../utils/prisma";
import { CustomException } from "../exception/custom.exception";
import { getCurrentDateFormatted } from "../utils/common";
import baseLogger from "../utils/logger/winston";

export const uploadDir = path.join(__dirname, "../../uploads");

const allowedExt = [".jpg", ".jpeg", ".png"];

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

export const extractAndVerifyToken = async (request: FastifyRequest) => {
  const token = request.headers.authorization;
  if (!token) {
    throw new UnauthorizedException(
      fmt.formatError({
        message: "Authentication Error!",
        description: "Authorization Token Required!",
      })
    );
  }

  if (typeof token !== "string") {
    throw new UnauthorizedException(
      fmt.formatError({
        message: "Authentication Error!",
        description: "The token is not in valid format!",
      })
    );
  }

  const auth_token: any = token.split(" ")[1]; // in format Bearer token
  const decodeduser = await verifyJwt(auth_token);
  return decodeduser;
};

export const preUserHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    
    const token: any = request.headers.authorization;
    const decodeduser = await extractAndVerifyToken(request);
    const { id, phoneNo, role } = decodeduser?.data;
 
    let user;
  
    user = await prisma.user.findUnique({
      where: { id, phoneNo, role },
    }); 

    if (!user) {
      throw new UnauthorizedException(
        fmt.formatError({
          message: "Authentication Error!",
          description: "The token is not in valid format!",
        })
      );
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId: id,
        token: token.split(" ")[1],
        logType: "login",
        expired: false,
        //   token: {
        //       not: null,
        //   },
      },
    });
    if (!sessions.length) {
      throw new UnauthorizedException(
        fmt.formatError({
          message: "Session is expired, Try to login again!",
          description: "Session is expired, Try to login again!",
        })
      );
     }
  
  if (user?.status === false) {
      await prisma.session.updateMany({
          where: {
              userId: id,
              logType: "login",
              expired: false,
          },
          data: {
              refreshToken: null,
              token: null,
              expired: true,
          },
      });
    // return "Session is expired!"
  }

    (request.requestContext.set as (key: string, value: unknown) => void)("data", {
      ...decodeduser,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDescription = 
      error && typeof error === 'object' && 'description' in error
        ? String(error.description)
        : 'Authentication failed';

    baseLogger.error('Authentication middleware error', {
      error: errorMessage,
      url: request.url,
      method: request.method,
    });

    reply.status(401).send(
      fmt.formatError({
        message: errorMessage,
        description: errorDescription,
      })
    );
  }
};

/**
 * Logs response payload for debugging (development only)
 * 
 * @param _request - Fastify request object (unused)
 * @param _reply - Fastify reply object (unused)
 * @param payload - Response payload to log
 * @returns The payload unchanged
 */
export const logResponsePayload = async (
  _request: FastifyRequest,
  _reply: FastifyReply,
  payload: unknown
): Promise<unknown> => {
  if (process.env.NODE_ENV !== "PRODUCTION") {
    baseLogger.debug('Response payload', { payload });
  }
  return payload;
};


/**
 * Pre-handler middleware for file/image uploads
 * Validates file type, size, and MIME type before saving
 * 
 * @param req - Fastify request object
 * @param reply - Fastify reply object
 */
// export async function uploadFileOrImagePreHandler(
//   req: FastifyRequest,
//   reply: FastifyReply
// ): Promise<void> {
//   try {
//     baseLogger.debug('File upload middleware triggered');
//     const parts = req.parts();
//     const formFields: Record<string, string> = {};
//     let fileInfo: {
//       originalName: string;
//       mimeType: string;
//       encoding: string;
//       filename: string;
//       savedPath: string;
//       sizeInBytes?: number;
//       sizeInKB?: string;
//       sizeInMB?: string;
//     } | null = null;

//     const { fileTypeFromBuffer } = await import('file-type');

//     for await (const part of parts) {

//       if (part.type === "file" && (part.fieldname === "image" || part.fieldname === "file")) {

//         const file = part as MultipartFile;
//         const ext = path.extname(file.filename).toLowerCase();

//         if (!allowedExt.includes(ext)) {
//           throw new CustomException(
//             fmt.formatError({
//               message: "File type should be only .png, .jpg or .jpeg",
//               description: "File not uploaded. please retry",
//             })
//           );
//         }

//         const chunks: Buffer[] = [];
//         let totalSize = 0;

//         for await (const chunk of file.file) {
//           chunks.push(chunk);
//           totalSize += chunk.length;
//         }

//         if (totalSize === 0) {
//           throw new CustomException(
//             fmt.formatError({
//               message: "File is empty, please upload a valid file.",
//               description: "Please upload a valid file.",
//             })
//           );
//         }

//         if (totalSize > 2 * 1024 * 1024) {
//           throw new CustomException(
//             fmt.formatError({
//               message: "File too large, Max allowed size is 2MB.",
//               description: "Max allowed size is 2MB.",
//             })
//           );
//         }

//         const fileBuffer = Buffer.concat(chunks);
//         const type = await fileTypeFromBuffer(fileBuffer);
//         baseLogger.debug('File MIME type detected', { mimeType: type?.mime });

//         /** strictly check the actuall file type to avoid hacker attempts */
//         if (!type || !["image/jpeg", "image/jpg", "image/png"].includes(type.mime)) {
//           throw new CustomException(
//             fmt.formatError({
//               message: "Invalid or unsafe file type, upload only valid image files (JPEG, JPG, PNG)",
//               description: "Upload only valid image files (JPEG, JPG, PNG).",
//             })
//           );
//         }

//         const currentDate = getCurrentDateFormatted();
//         const fileName = `${part.fieldname || "uploaded_file"}_${currentDate}${ext}`;
//         const filePath = path.join(uploadDir, fileName);
//         fs.writeFileSync(filePath, fileBuffer); // write only after all checks

//         fileInfo = {
//           originalName: file.filename,
//           mimeType: file.mimetype,
//           encoding: file.encoding,
//           filename: fileName,
//           savedPath: filePath,
//           sizeInBytes: totalSize,
//           sizeInKB: `${(totalSize / 1024).toFixed(2)} KB`,
//           sizeInMB: `${(totalSize / (1024 * 1024)).toFixed(2)} MB`,
//         };

//         baseLogger.info('File uploaded successfully', {
//           filename: fileInfo.filename,
//           size: fileInfo.sizeInBytes,
//           mimeType: fileInfo.mimeType,
//         });

//       }
//       else if (part.type === "field") {
//         formFields[part.fieldname] = part.value as string;
//       }
//     }

//     // if (!fileInfo) {
//     //   return reply.code(400).send({ error: "image file is required" });
//     // }

//     // Attach to request
//     (req as any).body = formFields;
//     (req as any).file = fileInfo;

//   } catch (error: unknown) {
//     const status = error && typeof error === 'object' && 'status' in error
//       ? Number(error.status)
//       : 500;
//     const code = error && typeof error === 'object' && 'code' in error
//       ? String(error.code)
//       : 'E500';
//     const message = error instanceof Error
//       ? error.message
//       : 'File upload failed';
//     const description = error && typeof error === 'object' && 'description' in error
//       ? String(error.description)
//       : 'An error occurred while saving uploaded file';

//     baseLogger.error('File upload error', {
//       error: message,
//       status,
//       code,
//     });

//     return reply.status(status).send(
//       fmt.formatError({
//         status,
//         code,
//         message,
//         description,
//       })
//     );
//   }
// }
