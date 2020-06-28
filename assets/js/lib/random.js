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

Random.prototype.phone = function randomPhone() {
  const source = "0123456789";
  let phone = "0";
  for (let i = 0; i < 10; i += 1) {
    phone += source[this.number(0, 10)];
  }
  return phone;
};

export default Random;
