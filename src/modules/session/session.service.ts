import { prisma } from '../../utils/prisma';
import MobileDetect from 'mobile-detect';

interface CreateSessionInput {
  userId: number;
  token: string | null;
  ipAddress: string;
  logType: string;
  refreshToken?: string | null;
  browserInfo?: string | null;
  device?: string | null;
  isSuper?: boolean | null;
  isReadOnly?: boolean | null;
  isDemo?: boolean | null;
}

export const createSession = async (input: CreateSessionInput) => {
  const { userId, token, ipAddress, logType, refreshToken, browserInfo, isSuper, isReadOnly, isDemo } = input;

  // Detect the device type using MobileDetect
  const md = new MobileDetect(browserInfo || "");
  let device = 'desktop';
  if (md.mobile()) {
    device = 'mobile';
  } else if (md.tablet()) {
    device = 'tablet';
  }

  // Create session in the database
  return await prisma.session.create({
    data: {
      userId,
      token,
      refreshToken,
      ipAddress,
      logType,
      browserInfo,
      device,
      isSuper,
      isReadOnly,
      isDemo
    },
  });
};

export const logLogout = async (userId: number,  ipAddress: string, browserInfo: any, isSuper: boolean) => {
  await prisma.session.updateMany({
    where: {
      userId, 
      logType: 'login',
      expired: false,
      isSuper: isSuper,
    },
    data: {
      refreshToken: null,
      token: null,
      expired: true 
    },
  });
 
  const token = null;
  const refreshToken = null;
  // Detect the device type using MobileDetect
  const md = new MobileDetect(browserInfo || "");
  let device = 'desktop';
  if (md.mobile()) {
    device = 'mobile';
  } else if (md.tablet()) {
    device = 'tablet';
  }
  
  // Create a new record for logout
  return createSession({ userId, token, ipAddress, logType: 'logout',refreshToken, browserInfo, device });
};

export async function pastLoginActivities(userId: number, filters: any) {
  let where: any = {}
  if (filters.dateFrom && filters.dateTo) {
    const dateFrom = new Date(filters.dateFrom);
    const dateTo = new Date(filters.dateTo);
  
    // Adjust dateTo to include the entire day
    dateTo.setHours(23, 59, 59, 999);
  
    where.createdAt = {
      gte: dateFrom,
      lte: dateTo,
    };
  }
  where.userId = userId;
  where.isSuper = false;
  where.isReadOnly = false;
  where.isDemo = false;
  where.logType = 'login'
  const agents = await prisma.session.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });
  return agents;
}
