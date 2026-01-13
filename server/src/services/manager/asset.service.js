import { Asset } from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";

import { Op } from "sequelize";

import STATUS from "../../constants/Status.js";

export const getAllAsset = async () => {
  try {
    let data = await Asset.findAll();

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

export const getAvailableAssetsService = async () => {
  let response = await Asset.findAll({
    where: {
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
