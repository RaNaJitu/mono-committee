import { FastifyRequest, FastifyReply } from 'fastify';
import { logLogout, createSession, pastLoginActivities } from './session.service';
import { getDataFromRequestContext } from '../auth/helper';
import { fmt } from '../../config';
import MobileDetect from 'mobile-detect';
import baseLogger from '../../utils/logger/winston';
import { AuthenticatedUserPayload } from '../auth/auth.types';

interface CreateSessionBody {
  userId: number;
  token: string;
}

interface LogoutBody {
  userId: number;
  token?: string;
}

interface LoginActivitiesQuery {
  dateFrom?: Date;
  dateTo?: Date;
}

interface LoginActivitiesFilters {
  dateFrom?: Date;
  dateTo?: Date;
}

export class SessionController {
  /**
   * Creates a new login session
   * 
   * @param request - Fastify request with userId and token in body
   * @param reply - Fastify reply object
   */
  static async createSession(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { userId, token } = request.body as CreateSessionBody;
    const ipAddress = request.ip || 'unknown';
    const browserInfo = (request.headers['user-agent'] as string) || 'unknown';
    const md = new MobileDetect(browserInfo);

    let device = 'desktop';
    if (md.mobile()) {
      device = 'mobile';
    } else if (md.tablet()) {
      device = 'tablet';
    }

    try {
      const session = await createSession({ 
        userId, 
        token, 
        ipAddress, 
        logType: 'login', 
        browserInfo, 
        device 
      });
      reply.status(201).send(session);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      baseLogger.error('Failed to create session', { 
        error: errorMessage,
        userId,
      });
      reply.status(500).send({ 
        error: 'Failed to log login',
        message: 'An error occurred while creating session',
      });
    }
  }

  /**
   * Logs out a user session
   * 
   * @param request - Fastify request with userId in body
   * @param reply - Fastify reply object
   */
  static async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { userId } = request.body as LogoutBody;
    const ipAddress = request.ip || 'unknown';

    try {
      const browserInfo = (request.headers['user-agent'] as string) || 'unknown';
      await logLogout(userId, ipAddress, browserInfo, false);
      reply.status(200).send({ 
        message: 'Successfully logged out and marked token as expired' 
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      baseLogger.error('Failed to log logout', { 
        error: errorMessage,
        userId,
      });
      reply.status(500).send({ 
        error: 'Failed to log logout',
        message: 'An error occurred while logging out',
      });
    }
  }

  /**
   * Retrieves past login activities for authenticated user
   * 
   * @param request - Fastify request with optional dateFrom and dateTo query params
   * @param reply - Fastify reply object
   */
  static async loginActivites(
    request: FastifyRequest<{ Querystring: LoginActivitiesQuery }>, 
    reply: FastifyReply
  ): Promise<void> {
    try {
      const authUser = getDataFromRequestContext<AuthenticatedUserPayload>(request, "data");
      const filters: LoginActivitiesFilters = {
        dateFrom: request.query.dateFrom
          ? new Date(request.query.dateFrom)
          : undefined,
        dateTo: request.query.dateTo
          ? new Date(request.query.dateTo)
          : undefined,
      };
      const session = await pastLoginActivities(authUser.id, filters);
      reply
        .status(200)
        .send(fmt.formatResponse(session, "User login activities"));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      baseLogger.error('Failed to fetch login activities', { 
        error: errorMessage,
      });
      reply.status(500).send({ 
        error: 'Unable to fetch the past login details',
        message: 'An error occurred while fetching login activities',
      });
    }
  }
}
