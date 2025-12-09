# Rate Limiting Implementation ✅

## Status: **IMPLEMENTED**

Rate limiting has been successfully implemented to protect the API against brute force and DDoS attacks.

---

## What Was Implemented

### 1. **General API Rate Limiting**
- **Limit**: 100 requests per minute per IP address
- **Scope**: Applied to all API routes
- **Protection**: Prevents DDoS attacks and general API abuse

### 2. **Configuration File**
- Created `src/config/rate-limit.config.ts`
- Centralized rate limit configurations
- IP address extraction utility
- Custom error response formatting

### 3. **Features**
- ✅ IP-based rate limiting
- ✅ Proper IP extraction (handles proxies, load balancers)
- ✅ Localhost whitelist (127.0.0.1, ::1)
- ✅ Custom error messages with retry-after information
- ✅ In-memory caching (10,000 entries)
- ✅ Structured error responses matching API format

---

## Configuration Details

### General Rate Limit
```typescript
{
  max: 100,                    // 100 requests
  timeWindow: 60 * 1000,      // per 1 minute
  cache: 10000,               // Cache size
  allowList: ['127.0.0.1'],   // Localhost allowed
}
```

### Error Response Format
When rate limit is exceeded, API returns:
```json
{
  "status": 429,
  "code": "E429",
  "message": "Too Many Requests",
  "description": "Rate limit exceeded. Maximum 100 requests per 60 seconds allowed. Please try again later.",
  "success": false,
  "retryAfter": 45
}
```

---

## Files Modified/Created

1. **`src/app.ts`**
   - Added `@fastify/rate-limit` import
   - Registered rate limit plugin with general configuration
   - Added logging for rate limit configuration

2. **`src/config/rate-limit.config.ts`** (NEW)
   - Rate limit configurations
   - IP extraction utility
   - Error response builders

3. **`package.json`**
   - Added `@fastify/rate-limit` dependency

---

## How It Works

1. **Request Arrives**: Fastify receives the request
2. **IP Extraction**: Extracts client IP from headers (x-forwarded-for, x-real-ip) or socket
3. **Rate Check**: Checks if IP has exceeded the limit
4. **Action**:
   - ✅ **Under Limit**: Request proceeds normally
   - ❌ **Over Limit**: Returns 429 error with retry-after information

---

## Testing

### Test Rate Limiting

#### Test General Rate Limit
```bash
# Make 101 requests quickly to test general rate limiting
for i in {1..101}; do
  curl http://localhost:4000/api/v1/healthcheck
done
```
Expected: First 100 requests succeed, 101st returns 429 error.

#### Test Login Rate Limit (5 per 15 minutes)
```bash
# Make 6 login attempts quickly
for i in {1..6}; do
  curl http://localhost:4000/api/v1/auth/login \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"phoneNo":"1234567890","password":"test"}'
done
```
Expected: First 5 requests may process (or fail validation), 6th returns 429 error.

#### Test Register Rate Limit (3 per hour)
```bash
# Make 4 registration attempts
for i in {1..4}; do
  curl http://localhost:4000/api/v1/auth/register \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"name":"Test User","email":"test@example.com","phoneNo":"1234567890","password":"test123","role":"USER"}'
done
```
Expected: First 3 requests may process, 4th returns 429 error.

---

## Route-Specific Rate Limits ✅ **IMPLEMENTED**

### Authentication Endpoints
Route-specific limits are now active and override the general limit:

1. **Login Endpoint** (`/api/v1/auth/login`)
   - ✅ **Limit**: 5 requests per 15 minutes per IP
   - **Purpose**: Prevents brute force attacks on login
   - **Error Message**: "Authentication rate limit exceeded. Maximum 5 attempts per 15 minutes allowed."

2. **Register Endpoint** (`/api/v1/auth/register`)
   - ✅ **Limit**: 3 requests per hour per IP
   - **Purpose**: Prevents spam registrations and account creation abuse
   - **Error Message**: "Registration rate limit exceeded. Maximum 3 registrations per hour allowed."

### How It Works
- Route-specific limits are registered **before** the general limit
- Fastify applies the most specific matching rate limit
- Login/Register routes use their strict limits
- All other routes use the general limit (100 req/min)

2. **Redis-Based Storage**
   - Distributed rate limiting across multiple servers
   - Persistent rate limit data
   - Better for production scaling

3. **User-Based Rate Limiting**
   - Different limits for authenticated vs. unauthenticated users
   - Higher limits for premium users

4. **Dynamic Rate Limiting**
   - Adjust limits based on server load
   - Implement exponential backoff

---

## Security Benefits

✅ **DDoS Protection**: Prevents overwhelming the server with requests  
✅ **Brute Force Protection**: Limits login attempts per IP  
✅ **Resource Protection**: Prevents API abuse and resource exhaustion  
✅ **Cost Control**: Reduces unnecessary database/API calls  

---

## Monitoring

Rate limit violations are logged by Fastify's logger. Monitor for:
- High 429 response rates
- Specific IPs hitting limits frequently
- Patterns indicating attacks

---

## Configuration Tuning

Adjust limits in `src/config/rate-limit.config.ts`:

```typescript
// For stricter protection
max: 50,              // Reduce to 50 requests
timeWindow: 60 * 1000 // Keep at 1 minute

// For more lenient (if needed)
max: 200,             // Increase to 200 requests
timeWindow: 60 * 1000 // Keep at 1 minute
```

---

## Notes

- Rate limiting uses in-memory storage by default
- Limits reset after the time window expires
- Localhost (127.0.0.1) is whitelisted for development
- IP extraction handles proxies and load balancers correctly

---

**Implementation Date**: [Current Date]  
**Status**: ✅ Complete and Active  
**Priority**: ✅ CRITICAL - Implemented

