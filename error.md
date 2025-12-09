“Best practices” for error handling boil down to consistency, observability, and fail-safe behavior. With Fastify and Prisma, here’s what I’d follow:
Centralized handler: one global app.setErrorHandler() that logs and serializes every error. Route handlers should just throw—never handcraft 500 responses or leak stack traces.
Typed exceptions: use HttpException subclasses (BadRequestException, ForbiddenException, InternalServerErrorException) to encode status/code/message once. Domain errors bubble up as these typed exceptions so the global handler knows how to respond.
Validation first: validate inputs (Zod schemas) before touching DB. Throw a BadRequestException with a clear message/description. Fastify’s validation errors get normalized in the global handler.
No raw errors: inside controllers/services, wrap try/catch only when you need to add context. When you catch, log with baseLogger.error({ err, context }), then rethrowAsHttpException(err, "User-friendly message"). Never return raw Error objects.
Consistent response shape: always respond with fmt.formatResponse or fmt.formatError. Even success responses go through formatResponse so clients get consistent data/message/success structure.
Prisma level guarding: wrap multi-step DB operations in transactions; ensure any throw rolls back. Map TS enums to Prisma enums so you don’t send invalid values.
No silent console logs: use your logger (with metadata about the request). Include request IDs if possible (Fastify request context can store them).
Fail fast on missing context: helpers like getDataFromRequestContext should throw BadRequestException when data is missing instead of returning undefined.
Monitor & alert: forward logs to a sink (Datadog, Loki, etc.) and alert on spikes of specific error codes.
With those patterns (most already started in your code), every failure path is predictable: validation errors → 400, forbidden → 403, not found → 404, unknowns → 500. All carry consistent JSON, useful logs, and nothing sensitive leaked.






You’ve now got most of the best practices covered:
Centralized handler – app.setErrorHandler logs, normalizes validation errors, and responds with fmt.formatError. ✔️
Typed exceptions + rethrow helper – controllers/services now throw BadRequestException, ForbiddenException, etc., and the catch blocks use rethrowAsHttpException so the global handler applies the formatting. ✔️
Consistent response envelope – success paths all call fmt.formatResponse. ✔️
Validation errors – Fastify’s built-in validation failures flow through the global handler, so clients get a 400 with the same structure. ✔️
Prisma safeguards – multi-step operations (committee member creation) run inside transactions, and updateCommitteeStatus now maps enums correctly. ✔️
Logging – controllers log via baseLogger.error({ err, ... }) so you have rich context. ✔️
Remaining watch points:
Enum alignment: Prisma’s CommitteeStatusEnum is still mapped to "0" / "1" / "2" via @map; your TypeScript enum wasn’t updated back (still string). If you call Prisma with CommitteeStatus.ACTIVE, you’ll send "ACTIVE", not "1". Either convert before writing or switch Prisma enum back to string values.
Committee service: a few functions still return Promise<any> and accept any payloads. Add interfaces (DTOs) so errors are caught at compile time.
Request context errors: getDataFromRequestContext now throws BadRequestException, good—but consider adding request ID/logging there too so missing context is traceable.
Other than the enum mismatch and some any types, the error-handling pipeline is in the “pro” shape you wanted. If you want help aligning the enums or adding type-safe DTOs in committee services, let me know.