function Random() {}

Random.prototype.number = (min, max) => Math.floor(Math.random() * (max - min)) + min;

Random.prototype.string = function randomString(length, type = "all", prefix = "") {
  let source;
  if (type === "all") {
    source = "abcdefghijklmnopqrstuvwsyzABCDEFGHIJKLMNOPQRSTUVWSYZ0123456789";
  } else if (type === "number") {
    source = "0123456789";
  }
  const sourceLength = source.length;
  let string = prefix;
  for (let i = 0; i < length - prefix.length; i += 1) {
    string += source[this.number(0, sourceLength)];
  }
  return string;
};

export default Random;
