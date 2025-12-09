import 'fastify';
import { Logger } from 'winston';

declare module 'fastify' {
  interface FastifyRequest {
    logger: Logger; // Add Winston logger to the request object
  }
}

declare module 'kill-port' {
  function killPort(port: number): Promise<void>;
  export default killPort;
}