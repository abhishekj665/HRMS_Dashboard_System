export const getAdminRoom = (tenantId) => `admin:${tenantId}`;

export const getManagerRoom = (tenantId) => `manager:${tenantId}`;

export const getUserRoom = (userId, tenantId) => `user:${tenantId}:${userId}`;
