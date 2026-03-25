import { Organization } from "../models/Associations.model.js";

const normalizeOrganizationSlug = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getOrganizationPublicSlug = (organization) =>
  normalizeOrganizationSlug(organization?.domain || organization?.name || "");

export const findOrganizationByPublicSlug = async (orgSlug, transaction) => {
  const normalizedSlug = normalizeOrganizationSlug(orgSlug);

  if (!normalizedSlug) {
    return null;
  }

  const organizations = await Organization.findAll({
    attributes: ["id", "name", "domain"],
    transaction,
  });

  return (
    organizations.find(
      (organization) =>
        getOrganizationPublicSlug(organization) === normalizedSlug,
    ) || null
  );
};
