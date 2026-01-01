export const getPagination = (page = 1, limit = 5) => {
  const offset = (page - 1) * limit;
  return { limit, offset };
};
