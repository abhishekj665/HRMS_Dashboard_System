import { Op } from "sequelize";
import STATUS from "../constants/Status.js";
import ExpressError from "./Error.utils.js";

export const getTenantIdFromUser = (user) => user?.tenantId || null;

export const requireTenantId = (user) => {
  const tenantId = getTenantIdFromUser(user);

  if (!tenantId) {
    throw new ExpressError(
      STATUS.BAD_REQUEST,
      "Tenant is missing for this user",
    );
  }

  return tenantId;
};

export const getScopedWhere = (user, extraWhere = {}) => ({
  ...extraWhere,
  tenantId: requireTenantId(user),
});

export const getTenantOrGlobalWhere = (tenantId, extraWhere = {}) => ({
  ...extraWhere,
  [Op.or]: [{ tenantId }, { tenantId: null }],
});

export const assertSameTenant = (record, tenantId, entityName = "Record") => {
  if (!record) {
    throw new ExpressError(STATUS.NOT_FOUND, `${entityName} not found`);
  }

  if (record.tenantId && record.tenantId !== tenantId) {
    throw new ExpressError(
      STATUS.FORBIDDEN,
      `${entityName} does not belong to your organization`,
    );
  }

  return record;
};
