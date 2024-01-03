export const blogsFilter = (searchNameTerm: string) => {
  let searchNameTermFilter = '%';

  if (searchNameTerm) {
    searchNameTermFilter = `%${searchNameTerm}%`;
  }

  if (!searchNameTerm) {
    searchNameTermFilter = '';
  }

  return {
    name: searchNameTermFilter,
  };
};
