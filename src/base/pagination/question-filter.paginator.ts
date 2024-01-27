export const questionsFilter = (bodySearchTerm: string | undefined) => {
  let bodySearchTermFilter = '%';

  if (bodySearchTerm) {
    bodySearchTermFilter = `%${bodySearchTerm}%`;
  }

  return {
    bodySearchTerm: bodySearchTermFilter,
  };
};
