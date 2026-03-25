import { Asset } from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";

import { Op } from "sequelize";

import STATUS from "../../constants/Status.js";
import { requireTenantId } from "../../utils/tenant.utils.js";

export const getAllAsset = async (user) => {
  try {
    let data = await Asset.findAll({
      where: { tenantId: requireTenantId(user) },
    });

    if (!data) {
      return {
        success: false,
        message: "Not found any asset",
      };
    }

    return {
      success: true,
      data: data,
      message: "Asset Fetched Successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getAvailableAssetsService = async (user) => {
  let response = await Asset.findAll({
    where: {
      tenantId: requireTenantId(user),
      availableQuantity: { [Op.gt]: 0 },
    },
    attributes: ["id", "title", "price", "category", "availableQuantity"],
  });

  return {
    success: true,
    data: response,
    message: "Assest Fetched Successfully",
  };
};
