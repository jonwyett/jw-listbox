function sort2DArray(data, sortColumns) {
    if (!Array.isArray(data) || !data.every(Array.isArray)) {
      return "Error: Input should be a 2D array.";
    }
  
    if (data.length === 0) {
      return "Error: Input array is empty.";
    }
  
    if (!Array.isArray(sortColumns)) {
      return "Error: Sort columns should be an array.";
    }
  
    for (let i = 0; i < sortColumns.length; i++) {
      const col = sortColumns[i];
      if (typeof col !== "number" || col < 0 || col >= data[0].length) {
        return "Error: One or more sort columns are invalid.";
      }
    }
  
    /*
    const sortedData = data.slice().sort(function(a, b) {
      for (let i = 0; i < sortColumns.length; i++) {
        const col = sortColumns[i];
        if (a[col] < b[col]) {
          return -1;
        }
        if (a[col] > b[col]) {
          return 1;
        }
      }
      return 0;
    });
  
    return sortedData;
  */

  data.sort(function(a, b) {
    for (let i = 0; i < sortColumns.length; i++) {
      const col = sortColumns[i];
      if (a[col] < b[col]) {
        return -1;
      }
      if (a[col] > b[col]) {
        return 1;
      }
    }
    return 0;
  });
}
  
  // Example usage:
  const data = [
    [3, 'apple', 10, 'red'],
    [1, 'banana', 20, 'yellow'],
    [3, 'apple', 5, 'green'],
    [1, 'apple', 15, 'red'],
    [2, 'cherry', 5, 'red'],
    [2, 'cherry', 15, 'dark red'],
    [1, 'banana', 25, 'yellow'],
    [1, 'apple', 10, 'green'],
    [3, 'apple', 12, 'red'],
    [2, 'berry', 8, 'blue'],
    [3, 'apple', 5, 'green'],
    [1, 'apple', 15, 'yellow']
  ];
  const sortColumns = [0,2,1,3];
  
  const sortedData = sort2DArray(data, sortColumns);
  
  if (typeof sortedData === "string") {
    console.log(data); // Output error message
  } else {
    console.log(data); // Output sorted data
  }
  