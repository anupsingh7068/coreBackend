export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500
} as const;

export const MESSAGES = {
    SUCCESS:"Operation successfully",
    CREATED: "Resouce created successfully",
    UPDATED:"Resouce updated successfully",
    DELETED: "Resouce deleted successfully",
    NOT_FOUND: "Resource not foudn",
    UNAUTHORIZED: "Unauthorized access",
    VALIDATION_ERROR: "validation failed"
} as const;
 
export const CACHE_KEYS = {
    USER_SESSION: "user_session",
    API_RATE_LIMIT: "rate_limit",
    TEMP_DATA: "temp_data:"
} as const;
