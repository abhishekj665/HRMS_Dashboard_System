import ExpressError from "../../utils/Error.utils.js";
import { Candidate } from "../../models/Associations.model.js";
import STATUS from "../../constants/Status.js";
import { where } from "sequelize";
import { findOrganizationByPublicSlug } from "../../utils/organization.utils.js";

export const registerCandidate = async (data) => {
  try {
    const candidate = await Candidate.create(data);
    return {
      success: true,
      data: candidate,
      message: "Candidate created successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getCandidates = async () => {
  try {
    const candidates = await Candidate.findAll();
    if (!candidates)
      throw new ExpressError(STATUS.NOT_FOUND, "No candidates found");
    return {
      success: true,
      data: candidates,
      message: "Candidates fetched successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getCandidateByJobPost = async (id) => {
  try {
    const candidate = await Candidate.findAll({
      include: { model: JobPosting, where: { id: id } },
    });

    if (!candidate)
      throw new ExpressError(STATUS.NOT_FOUND, "No candidate found");
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getCandidate = async (email, orgSlug) => {
  try {
    const organization = await findOrganizationByPublicSlug(orgSlug);

    if (!organization)
      throw new ExpressError(STATUS.NOT_FOUND, "No organization found");

    const candidate = await Candidate.findOne({
      where: { email, tenantId: organization.id },
    });

    if (!candidate)
      throw new ExpressError(STATUS.NOT_FOUND, "No candidate found");

    return {
      success: true,
      data: candidate,
      message: "Candidate fetched successfully",
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
