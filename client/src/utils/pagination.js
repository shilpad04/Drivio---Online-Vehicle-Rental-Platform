export function paginate(items = [], page = 1, perPage = 10) {
  const totalPages = Math.ceil(items.length / perPage);
  const startIndex = (page - 1) * perPage;

  return {
    totalPages,
    paginatedItems: items.slice(startIndex, startIndex + perPage),
  };
}
