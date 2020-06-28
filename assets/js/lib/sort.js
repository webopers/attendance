const convertObjectToArray = (object) => {
  return Object.keys(object).map((itemID) => {
    return {
      itemID,
      ...object[itemID],
    };
  });
};

const convertArrayToObject = (array) => {
  const result = {};
  array.forEach((item) => {
    const itemData = item;
    const { itemID } = item;
    delete itemData.itemID;
    result[itemID] = { ...itemData };
  });
  return result;
};

const compareValues = (keyString, order = "asc") => {
  const keys = keyString.split("/");
  return (a, b) => {
    let valueA;
    let valueB;
    let type = "";
    if (keys.length === 1) {
      valueA = a[keyString];
      valueB = b[keyString];
    } else if (keys.length === 2) {
      valueA = a[keys[0]][keys[1]];
      valueB = b[keys[0]][keys[1]];
    }
    const varA = typeof valueA === "string" ? valueA.toUpperCase() : valueA;
    const varB = typeof valueB === "string" ? valueB.toUpperCase() : valueB;
    let comparison = 0;
    type = typeof valueA;
    if (type === "string") comparison = varA.localeCompare(varB);
    else if (type === "number") comparison = varA > varB ? 1 : -1;
    return order === "desc" ? comparison * -1 : comparison;
  };
};

const compareValuesArr = (order = "asc") => (a, b) => {
  let comparison = 0;
  comparison = a.localeCompare(b);
  return order === "desc" ? comparison * -1 : comparison;
};

const quickSort = (arr, compareFunc) => {
  if (arr.length < 2) return arr;

  const pivotIndex = arr.length - 1;
  const pivot = arr[pivotIndex];

  const left = [];
  const right = [];

  let currentItem;
  for (let i = 0; i < pivotIndex; i += 1) {
    currentItem = arr[i];
    if (compareFunc()(currentItem, pivot) === -1) {
      left.push(currentItem);
    } else {
      right.push(currentItem);
    }
  }

  return [...quickSort(left, compareFunc), pivot, ...quickSort(right, compareFunc)];
};

const sort = (items, key, order = "asc") => {
  let resultItems = convertObjectToArray(items);
  resultItems = quickSort(resultItems, () => compareValues(key, order));
  return convertArrayToObject(resultItems);
};

const sortArr = (items, order = "asc") => {
  const resultItems = quickSort(items, () => compareValuesArr(order));
  return resultItems;
};

export { sort, sortArr };
