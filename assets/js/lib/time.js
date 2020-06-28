const getTime = (type) => {
  const date = new Date();
  const today = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const month = date.getMonth() < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
  const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  if (type === "miliseconds") return date.getTime();
};

const getDate = (time = false) => {
  const date = new Date();
  return {
    date: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
};

const convertToCustomTime = (time, format) => {
  const date = new Date();
  date.setTime(time);
  if (format === "hh:mm") return { hours: date.getHours(), minutes: date.getMinutes() };
};

const increaseMonth = (number, month, year) => {
  const date = new Date();
  date.setMonth(month - 1);
  date.setFullYear(year);
  date.setMonth(date.getMonth() + number);
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
};

const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();

export { getTime, getDate, getDaysInMonth, increaseMonth, convertToCustomTime };
