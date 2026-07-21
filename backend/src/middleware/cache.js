import NodeCache from "node-cache";

// StdTTL sets standard time to live in seconds. Default is 5 minutes (300 seconds).
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

export const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    // Generate a unique key based on URL and query params
    const key = req.originalUrl;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      res.setHeader("X-Cache", "HIT");
      return res.status(200).json(cachedResponse);
    } else {
      res.setHeader("X-Cache", "MISS");
      
      // Override res.json to cache the response before sending it
      const originalSend = res.json;
      res.json = (body) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache.set(key, body, duration);
        }
        originalSend.call(res, body);
      };
      
      next();
    }
  };
};

export const clearCache = (prefix) => {
  const keys = cache.keys();
  const keysToDelete = keys.filter(key => key.startsWith(prefix));
  cache.del(keysToDelete);
};
