import { PrismaClient, Prisma } from "@prisma/client";
import baseLogger from './logger/winston';

function createPrismaClient(databaseUrl: string): PrismaClient {
  const isProduction = process.env.NODE_ENV === "PRODUCTION";
  
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: isProduction
      ? [
          { level: 'error', emit: 'event' },
          { level: 'warn', emit: 'event' }
        ]
      : [
          { level: 'query', emit: 'event' },
          { level: 'info', emit: 'event' },
          { level: 'warn', emit: 'event' },
          { level: 'error', emit: 'event' }
        ],
    errorFormat: isProduction ? 'minimal' : 'pretty', // Minimal error format in production
  });
}

// Helper function to attach Prisma log event listeners
function attachPrismaLogListeners(client: PrismaClient, clientName: string = 'main'): void {
  client.$on('query' as never, (e: Prisma.QueryEvent) => {
    baseLogger.debug(`[Prisma ${clientName}] Query: ${e.query}`, {
      params: e.params,
      duration: `${e.duration}ms`,
      target: e.target
    });
  });

  client.$on('info' as never, (e: Prisma.LogEvent) => {
    baseLogger.info(`[Prisma ${clientName}] ${e.message}`, e);
  });

  client.$on('warn' as never, (e: Prisma.LogEvent) => {
    baseLogger.warn(`[Prisma ${clientName}] ${e.message}`, e);
  });

  client.$on('error' as never, (e: Prisma.LogEvent) => {
    baseLogger.error(`[Prisma ${clientName}] ${e.message}`, e);
  });
}

// Read-only clients (only create if URLs are provided)
// These are optional - if not set, they will be undefined

// Validate DATABASE_URL_RW before creating Prisma client
const databaseUrl = process.env.DATABASE_URL_RW;
if (!databaseUrl) {
  throw new Error('DATABASE_URL_RW environment variable is not set');
}


const prisma = createPrismaClient(databaseUrl);
attachPrismaLogListeners(prisma, 'main');

// const prismaClientRO1 = process.env.DATABASE_URL_RO1 
//   ? (() => {
//       const client = createPrismaClient(process.env.DATABASE_URL_RO1);
//       attachPrismaLogListeners(client, 'RO1');
//       return client;
//     })()
//   : undefined;
  
// const prismaClientRO2 = process.env.DATABASE_URL_RO2 
//   ? (() => {
//       const client = createPrismaClient(process.env.DATABASE_URL_RO2);
//       attachPrismaLogListeners(client, 'RO2');
//       return client;
//     })()
//   : undefined;

// export { prisma, prismaClientRO1, prismaClientRO2 };
export { prisma };



