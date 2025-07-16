const fuzzySearch = (query: string, text: string): boolean => {
  const lowerCaseQuery = query.toLowerCase();
  const lowerCaseText = text.toLowerCase();
  let queryIndex = 0;
  let textIndex = 0;

  while (
    queryIndex < lowerCaseQuery.length &&
    textIndex < lowerCaseText.length
  ) {
    if (lowerCaseQuery[queryIndex] === lowerCaseText[textIndex]) {
      queryIndex++;
    }
    textIndex++;
  }

  return queryIndex === lowerCaseQuery.length;
};

export default fuzzySearch;
