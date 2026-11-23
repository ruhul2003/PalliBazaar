export function getPaginationMetadata(totalCount: number, page: number = 1, limit: number = 12) {
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const validPage = Math.max(1, Math.min(page, totalPages));
  return {
    currentPage: validPage,
    totalPages,
    limit,
    offset: (validPage - 1) * limit,
    hasMore: validPage < totalPages,
  };
}