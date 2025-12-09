# Professional Coding Standards & Best Practices

## 🎯 Core Principles to Always Follow

### 1. **SOLID Principles**
- ✅ **S**ingle Responsibility: Each function/class does ONE thing
- ✅ **O**pen/Closed: Open for extension, closed for modification
- ✅ **L**iskov Substitution: Subtypes must be substitutable
- ✅ **I**nterface Segregation: Many specific interfaces > one general
- ✅ **D**ependency Inversion: Depend on abstractions, not concretions

### 2. **DRY (Don't Repeat Yourself)**
- Extract common logic into reusable functions
- Use constants for magic numbers/strings
- Create utility functions for repeated patterns
- Avoid copy-paste code

### 3. **KISS (Keep It Simple, Stupid)**
- Prefer simple solutions over complex ones
- Write code that a junior developer can understand
- Avoid premature optimization
- Clear code > clever code

### 4. **YAGNI (You Aren't Gonna Need It)**
- Don't build features "just in case"
- Solve current problems, not future ones
- Remove unused code immediately
- Keep codebase lean

---

## 📝 Code Organization

### File Structure
```
✅ DO:
- One class/interface per file
- Group related functions together
- Use clear, descriptive file names
- Follow project conventions

❌ DON'T:
- Mix unrelated functionality
- Create files with generic names (utils.ts, helpers.ts)
- Put everything in one massive file
```

### Import Organization
```typescript
✅ DO:
// 1. External libraries
import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// 2. Internal modules (absolute paths)
import { prisma } from '@/utils/prisma';
import { logger } from '@/utils/logger';

// 3. Relative imports
import { UserService } from './user.service';
import { UserTypes } from './user.types';

// 4. Types (at the end)
import type { User, UserRole } from '@prisma/client';
```

### Function Organization
```typescript
✅ DO:
// 1. Exports at top (if small file)
// 2. Type definitions
// 3. Constants
// 4. Helper functions (private)
// 5. Main functions (public)
// 6. Default exports (if any)
```

---

## 🏷️ Naming Conventions

### Variables & Functions
```typescript
✅ DO:
- Use descriptive names: getUserById, calculateTotalPrice
- Use camelCase for variables/functions
- Use PascalCase for classes/interfaces/types
- Use UPPER_SNAKE_CASE for constants
- Use meaningful prefixes: is, has, can, should
- Use verbs for functions: create, update, delete, fetch

❌ DON'T:
- Single letter variables (except loop counters: i, j)
- Abbreviations: usr, usrSvc, tmp
- Generic names: data, item, obj, thing
- Negative boolean names: isNotValid → isValid
```

### Examples
```typescript
// ✅ GOOD
const userCount = await getUserCount();
const isAuthenticated = checkAuth(token);
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = process.env.API_URL;

// ❌ BAD
const cnt = await getCnt();
const auth = check(token);
const max = 3;
const url = process.env.API_URL;
```

### Files & Folders
```typescript
✅ DO:
- user.service.ts (not userService.ts)
- auth.controller.ts (not authController.ts)
- user.types.ts (not userTypes.ts)
- Use kebab-case for file names
- Match file name to main export

❌ DON'T:
- UserService.ts (PascalCase)
- user_service.ts (snake_case)
- utils.ts (too generic)
```

---

## 🔒 Type Safety

### Always Use Types
```typescript
✅ DO:
interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
}

function createUser(data: CreateUserRequest): Promise<User> {
  // Implementation
}

// Use type inference where appropriate
const users = await prisma.user.findMany(); // Type inferred

❌ DON'T:
function createUser(data: any): any {
  // Implementation
}

const users: any = await prisma.user.findMany();
```

### Avoid `any` Type
```typescript
✅ DO:
// Use unknown and type guards
function processData(data: unknown): void {
  if (typeof data === 'string') {
    // TypeScript knows data is string here
  }
}

// Use proper types
function handleError(error: Error | HttpException): void {
  // Implementation
}

❌ DON'T:
function processData(data: any): void {
  // No type safety
}
```

### Use Type Guards
```typescript
✅ DO:
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj
  );
}

if (isUser(data)) {
  // TypeScript knows data is User
  console.log(data.email);
}
```

---

## 🛡️ Error Handling

### Always Handle Errors
```typescript
✅ DO:
try {
  const user = await createUser(data);
  return user;
} catch (error) {
  if (error instanceof ValidationError) {
    throw new BadRequestException({ message: error.message });
  }
  logger.error('Failed to create user', { error, data });
  throw new InternalServerException({ message: 'User creation failed' });
}

❌ DON'T:
const user = await createUser(data); // No error handling
return user;
```

### Use Custom Exceptions
```typescript
✅ DO:
throw new NotFoundException({
  message: 'User not found',
  description: `User with ID ${userId} does not exist`,
});

throw new BadRequestException({
  message: 'Invalid email format',
  description: 'Email must be a valid email address',
});

❌ DON'T:
throw new Error('User not found'); // Generic error
return { error: 'Something went wrong' }; // Returning errors
```

### Error Messages
```typescript
✅ DO:
// User-friendly messages
throw new BadRequestException({
  message: 'Invalid input',
  description: 'Email address is required and must be valid',
});

// Log detailed info (not exposed to user)
logger.error('Validation failed', {
  error: validationError,
  input: sanitizedInput,
  userId: user.id,
});

❌ DON'T:
// Exposing internal details
throw new Error(`Database query failed: ${sqlQuery}`);
throw new Error(`Stack trace: ${error.stack}`);
```

---

## 📚 Documentation

### Function Documentation
```typescript
✅ DO:
/**
 * Creates a new user in the database
 * 
 * @param data - User creation data
 * @param data.name - User's full name (required, 2-100 chars)
 * @param data.email - User's email address (required, must be unique)
 * @param data.role - User's role (required, must be valid UserRole)
 * @returns Promise resolving to the created User
 * @throws {BadRequestException} If validation fails
 * @throws {ConflictException} If email already exists
 * 
 * @example
 * ```typescript
 * const user = await createUser({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   role: UserRole.USER
 * });
 * ```
 */
async function createUser(data: CreateUserRequest): Promise<User> {
  // Implementation
}

❌ DON'T:
// Creates user
function createUser(data) {
  // Implementation
}
```

### Code Comments
```typescript
✅ DO:
// Explain WHY, not WHAT
// Cache for 5 minutes to reduce database load
const cachedUsers = await getCachedUsers();

// Complex business logic explanation
// Calculate fine: (days_overdue - grace_period) * daily_fine_rate
const fineAmount = (overdueDays - GRACE_PERIOD) * DAILY_FINE_RATE;

❌ DON'T:
// Increment counter
counter++;

// Set user name
user.name = name;
```

### README & Documentation
```markdown
✅ DO:
- Clear project description
- Setup instructions
- API documentation
- Environment variables
- Common issues & solutions
- Contributing guidelines

❌ DON'T:
- Vague descriptions
- Missing setup steps
- Outdated information
- No examples
```

---

## 🧪 Testing

### Test Structure
```typescript
✅ DO:
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = createValidUserData();
      
      // Act
      const user = await userService.createUser(userData);
      
      // Assert
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
    });
    
    it('should throw BadRequestException for invalid email', async () => {
      // Arrange
      const invalidData = { ...createValidUserData(), email: 'invalid' };
      
      // Act & Assert
      await expect(userService.createUser(invalidData))
        .rejects.toThrow(BadRequestException);
    });
  });
});

❌ DON'T:
it('test user creation', async () => {
  const user = await createUser({ name: 'test', email: 'test@test.com' });
  expect(user).toBeTruthy();
});
```

### Test Coverage
```typescript
✅ DO:
- Test happy paths
- Test error cases
- Test edge cases
- Test boundary conditions
- Use descriptive test names

❌ DON'T:
- Only test happy paths
- Test implementation details
- Use vague test names
- Skip error cases
```

---

## 🔐 Security Best Practices

### Input Validation
```typescript
✅ DO:
// Always validate input
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

const validatedData = schema.parse(request.body);

❌ DON'T:
// Trust user input
const email = request.body.email;
const password = request.body.password;
```

### Sensitive Data
```typescript
✅ DO:
// Never log sensitive data
logger.info('User login attempt', {
  userId: user.id,
  // Don't log password, tokens, etc.
});

// Sanitize error messages
catch (error) {
  logger.error('Database error', { error }); // Log full error
  throw new InternalServerException({
    message: 'An error occurred', // Generic message to user
  });
}

❌ DON'T:
logger.info('User login', { password, token, creditCard });
throw new Error(`SQL Error: ${sqlQuery}`);
```

### SQL Injection Prevention
```typescript
✅ DO:
// Use ORM (Prisma)
const user = await prisma.user.findUnique({
  where: { email: userEmail }, // Parameterized
});

// Use parameterized queries
const result = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [userEmail]
);

❌ DON'T:
// Never use string concatenation
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;
```

---

## ⚡ Performance

### Database Queries
```typescript
✅ DO:
// Select only needed fields
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true },
});

// Use pagination
const users = await prisma.user.findMany({
  skip: (page - 1) * perPage,
  take: perPage,
});

// Use indexes
const user = await prisma.user.findUnique({
  where: { email }, // email should be indexed
});

❌ DON'T:
// Select all fields
const users = await prisma.user.findMany();

// No pagination
const allUsers = await prisma.user.findMany(); // Could be millions

// Full table scan
const user = await prisma.user.findFirst({
  where: { name: { contains: searchTerm } },
});
```

### Caching
```typescript
✅ DO:
// Cache expensive operations
const cacheKey = `user:${userId}`;
let user = await redis.get(cacheKey);

if (!user) {
  user = await prisma.user.findUnique({ where: { id: userId } });
  await redis.setex(cacheKey, 300, JSON.stringify(user)); // 5 min cache
}

❌ DON'T:
// Always hit database
const user = await prisma.user.findUnique({ where: { id: userId } });
```

### Async/Await
```typescript
✅ DO:
// Parallel independent operations
const [users, posts, comments] = await Promise.all([
  getUsers(),
  getPosts(),
  getComments(),
]);

// Sequential dependent operations
const user = await getUser(userId);
const posts = await getPostsByUser(user.id);

❌ DON'T:
// Unnecessary sequential
const users = await getUsers();
const posts = await getPosts(); // Could be parallel
const comments = await getComments(); // Could be parallel
```

---

## 🧹 Code Cleanliness

### Remove Dead Code
```typescript
✅ DO:
// Delete unused code immediately
// Remove commented-out code
// Remove console.log in production

❌ DON'T:
// Keep commented code "just in case"
// Leave console.log everywhere
// Keep unused imports
```

### Consistent Formatting
```typescript
✅ DO:
// Use consistent indentation (2 spaces)
// Use consistent quotes (single or double)
// Use consistent semicolons (always or never)
// Use Prettier/ESLint

❌ DON'T:
// Mix indentation
// Mix quote styles
// Inconsistent formatting
```

### Magic Numbers/Strings
```typescript
✅ DO:
const MAX_LOGIN_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const DEFAULT_PAGE_SIZE = 10;

if (attempts > MAX_LOGIN_ATTEMPTS) {
  throw new TooManyAttemptsException();
}

❌ DON'T:
if (attempts > 5) { // What is 5?
  throw new TooManyAttemptsException();
}

const window = 15 * 60 * 1000; // What is this?
```

---

## 🏗️ Architecture Patterns

### Controller-Service-Repository
```typescript
✅ DO:
// Controller: Handle HTTP, call service
export const createUser = async (request, reply) => {
  const user = await userService.createUser(request.body);
  return reply.status(201).send(formatResponse(user));
};

// Service: Business logic
export class UserService {
  async createUser(data: CreateUserRequest): Promise<User> {
    await this.validateUserData(data);
    return this.userRepository.create(data);
  }
}

// Repository: Database operations
export class UserRepository {
  async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({ data });
  }
}

❌ DON'T:
// Everything in controller
export const createUser = async (request, reply) => {
  const schema = z.object({...});
  const data = schema.parse(request.body);
  const user = await prisma.user.create({ data });
  return reply.send(user);
};
```

### Dependency Injection
```typescript
✅ DO:
class UserService {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService,
    private logger: Logger
  ) {}
}

❌ DON'T:
class UserService {
  private userRepository = new UserRepository();
  private emailService = new EmailService();
}
```

---

## 📦 Module Organization

### Export Patterns
```typescript
✅ DO:
// Named exports for utilities
export function formatDate(date: Date): string { }
export function validateEmail(email: string): boolean { }

// Default export for main class/service
export default class UserService { }

// Barrel exports (index.ts)
export { UserService } from './user.service';
export { UserRepository } from './user.repository';
export type { User, CreateUserRequest } from './user.types';

❌ DON'T:
// Mix default and named inconsistently
export default function createUser() { }
export function updateUser() { }
```

### File Organization
```typescript
✅ DO:
// user.service.ts
import { UserRepository } from './user.repository';
import type { User, CreateUserRequest } from './user.types';

export class UserService {
  // Implementation
}

// user.types.ts
export interface User { }
export interface CreateUserRequest { }

❌ DON'T:
// Everything in one file
// Mixing types, services, controllers
```

---

## 🔍 Code Review Checklist

Before submitting code, check:

- [ ] Code follows project conventions
- [ ] No `any` types (use proper types)
- [ ] Error handling implemented
- [ ] Input validation added
- [ ] No sensitive data in logs
- [ ] No hardcoded secrets/credentials
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] No console.log/debug code
- [ ] No commented-out code
- [ ] No unused imports/variables
- [ ] Performance considered (queries optimized)
- [ ] Security best practices followed
- [ ] Code is readable and maintainable

---

## 🎨 Code Style Examples

### Good Code
```typescript
/**
 * Validates and creates a new user account
 * 
 * @param data - User registration data
 * @returns Created user without sensitive fields
 * @throws {BadRequestException} If validation fails
 * @throws {ConflictException} If email already exists
 */
export async function registerUser(
  data: RegisterUserRequest
): Promise<PublicUser> {
  // Validate input
  const validatedData = registerUserSchema.parse(data);
  
  // Check if user exists
  const existingUser = await userRepository.findByEmail(validatedData.email);
  if (existingUser) {
    throw new ConflictException({
      message: 'Email already registered',
      description: 'This email address is already in use',
    });
  }
  
  // Hash password
  const hashedPassword = await hashPassword(validatedData.password);
  
  // Create user
  const user = await userRepository.create({
    ...validatedData,
    password: hashedPassword,
  });
  
  // Return public user (no password)
  return toPublicUser(user);
}
```

### Bad Code
```typescript
export async function register(data: any): Promise<any> {
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: data.password, // Not hashed!
      name: data.name,
    },
  });
  return user; // Returns password!
}
```

---

## 🚀 Quick Reference

### Always:
- ✅ Use TypeScript types
- ✅ Handle errors properly
- ✅ Validate input
- ✅ Write tests
- ✅ Document complex logic
- ✅ Follow SOLID principles
- ✅ Keep code DRY
- ✅ Use meaningful names
- ✅ Remove dead code
- ✅ Think about security

### Never:
- ❌ Use `any` type
- ❌ Ignore errors
- ❌ Trust user input
- ❌ Log sensitive data
- ❌ Hardcode secrets
- ❌ Copy-paste code
- ❌ Use magic numbers
- ❌ Leave console.log
- ❌ Comment out code
- ❌ Skip validation

---

## 📖 Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Clean Code by Robert Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Remember**: Code is read 10x more than it's written. Write for humans, not just computers.

*Last Updated: [Current Date]*

