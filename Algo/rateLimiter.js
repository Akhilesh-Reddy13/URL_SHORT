import {rateLimit} from "express-rate-limit";
function limiter(options={}){
    return rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
        limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        ipv6Subnet: 56,
        ...options,
    })
}

export default limiter;