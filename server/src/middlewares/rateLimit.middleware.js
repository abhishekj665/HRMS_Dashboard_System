import rateLimit from "express-rate-limit";

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const STANDARD_REQUEST_LIMIT = 300;
export const AUTH_REQUEST_LIMIT = 12;

export const createRateLimiter = ({
  windowMs = RATE_LIMIT_WINDOW_MS,
  limit = STANDARD_REQUEST_LIMIT,
  message = "Too many requests. Please try again later.",
  skip,
} = {}) =>
  // Default MemoryStore is per-process; use a shared store for multi-instance deployments.
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    skip,
    handler: (_req, res) =>
      res.status(429).json({
        success: false,
        message,
      }),
  });


export const shouldSkipStandardRateLimit = (req) => req.path === "/payment/webhook";

export const standardRateLimiter = createRateLimiter({
  skip: shouldSkipStandardRateLimit,
});
export const authRateLimiter = createRateLimiter({
  limit: AUTH_REQUEST_LIMIT,
  message: "Too many authentication attempts. Please try again later.",
});
