export const blogsFilter = (searchNameTerm: string) => {
  let searchNameTermFilter = '%';

  if (searchNameTerm) {
    searchNameTermFilter = `%${searchNameTerm}%`;
  }

  return {
    name: searchNameTermFilter,
  };
};
