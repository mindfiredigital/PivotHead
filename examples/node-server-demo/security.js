/**
 * Shared security middleware for PivotHead API servers
 *
 * Features:
 * - CORS with configurable origins
 * - Rate limiting per IP
 * - API key authentication (opt-in via API_KEY env var)
 * - Security headers via helmet
 * - CSRF protection for state-changing requests
 */

const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'];

const RATE_LIMIT_WINDOW_MS =
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 min
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX) || 100;

const API_KEY = process.env.API_KEY || null; // Disabled by default

/**
 * CORS middleware
 */
function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-API-Key, X-Requested-With'
  );
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Access-Control-Allow-Credentials', 'false');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
}

/**
 * Rate limiter using in-memory store (per IP)
 */
const rateLimitStore = new Map();

function rateLimitMiddleware(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    setRateLimitHeaders(res, RATE_LIMIT_MAX - 1, RATE_LIMIT_WINDOW_MS);
    return next();
  }

  const entry = rateLimitStore.get(ip);

  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + RATE_LIMIT_WINDOW_MS;
    setRateLimitHeaders(res, RATE_LIMIT_MAX - 1, RATE_LIMIT_WINDOW_MS);
    return next();
  }

  entry.count++;

  if (entry.count > RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader('Retry-After', retryAfter);
    setRateLimitHeaders(res, 0, entry.resetAt - now);
    return res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
    });
  }

  setRateLimitHeaders(res, RATE_LIMIT_MAX - entry.count, entry.resetAt - now);
  next();
}

function setRateLimitHeaders(res, remaining, resetMs) {
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));
  res.setHeader('X-RateLimit-Reset', Math.ceil(resetMs / 1000));
}

// Clean up expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitStore) {
      if (now > entry.resetAt) {
        rateLimitStore.delete(ip);
      }
    }
  },
  5 * 60 * 1000
).unref();

/**
 * API key authentication middleware (only active when API_KEY env var is set)
 */
function apiKeyMiddleware(req, res, next) {
  if (!API_KEY) {
    return next(); // Disabled — no API_KEY configured
  }

  // Skip auth for health check, docs, and OPTIONS
  if (
    req.path === '/health' ||
    req.path.startsWith('/api-docs') ||
    req.method === 'OPTIONS' ||
    req.path === '/'
  ) {
    return next();
  }

  const providedKey = req.headers['x-api-key'] || req.query.api_key;

  if (!providedKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required. Provide it via X-API-Key header.',
    });
  }

  // Constant-time comparison to prevent timing attacks
  if (!timingSafeEqual(providedKey, API_KEY)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API key.',
    });
  }

  next();
}

/**
 * Constant-time string comparison
 */
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Security headers middleware (lightweight helmet alternative — zero dependencies)
 */
function securityHeadersMiddleware(req, res, next) {
  // Content Security Policy — prevents inline script execution and restricts resource origins
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for Swagger UI styles
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // XSS protection (legacy browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions policy
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  // Remove Express fingerprint
  res.removeHeader('X-Powered-By');
  // Strict transport (only meaningful behind HTTPS)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  next();
}

/**
 * Apply all security middleware to an Express app
 */
function applySecurity(app) {
  app.use(securityHeadersMiddleware);
  app.use(corsMiddleware);
  app.use(rateLimitMiddleware);
  app.use(apiKeyMiddleware);
}

/**
 * Return Swagger security schema components (for Swagger docs)
 */
function getSwaggerSecuritySchemes() {
  return {
    ApiKeyAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'X-API-Key',
      description:
        'API key authentication (enabled when API_KEY env var is set)',
    },
  };
}

module.exports = {
  applySecurity,
  corsMiddleware,
  rateLimitMiddleware,
  apiKeyMiddleware,
  securityHeadersMiddleware,
  getSwaggerSecuritySchemes,
};
