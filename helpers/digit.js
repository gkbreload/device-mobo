function fiveDigits(number) {
  return number.toString().padStart(5, "0");
}

module.exports = {
  fiveDigits,
};
