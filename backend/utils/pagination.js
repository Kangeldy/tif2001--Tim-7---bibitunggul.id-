/**
 * Parse query parameters for LIMIT/OFFSET or page/limit pagination.
 */
const parsePagination = ({ page, limit, offset } = {}, defaultLimit = 10, maxLimit = 100) => {
  const rawLimit = parseInt(limit, 10);
  const parsedLimit = Number.isNaN(rawLimit)
    ? defaultLimit
    : Math.min(Math.max(rawLimit, 1), maxLimit);

  let parsedOffset;
  let parsedPage;

  if (offset !== undefined && offset !== "" && !Number.isNaN(parseInt(offset, 10))) {
    parsedOffset = Math.max(0, parseInt(offset, 10));
    parsedPage = Math.floor(parsedOffset / parsedLimit) + 1;
  } else {
    const rawPage = parseInt(page, 10);
    parsedPage = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    parsedOffset = (parsedPage - 1) * parsedLimit;
  }

  return {
    page: parsedPage,
    limit: parsedLimit,
    offset: parsedOffset,
    from: parsedOffset,
    to: parsedOffset + parsedLimit - 1,
  };
};

/**
 * Build standardized JSON pagination metadata.
 */
const buildPaginationMeta = ({ total, page, limit, offset }) => {
  const totalItems = Math.max(0, Number(total) || 0);
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

  return {
    total: totalItems,
    limit,
    offset,
    page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1 && totalPages > 0,
  };
};

module.exports = {
  parsePagination,
  buildPaginationMeta,
};
