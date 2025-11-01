const getDate = (data) => {
  let year, month, day;
  if (data === "today") {
    year = new Date().getFullYear();
    month = String(new Date().getMonth() + 1).padStart(2, "0");
    day = String(new Date().getDate()).padStart(2, "0");
  }
  if (data === "tomorrow") {
    const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    year = tomorrow.getFullYear();
    month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    day = String(tomorrow.getDate()).padStart(2, "0");
  }
  if (data === "yesterday") {
    const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    year = yesterday.getFullYear();
    month = String(yesterday.getMonth() + 1).padStart(2, "0");
    day = String(yesterday.getDate()).padStart(2, "0");
  }

  return `${year}-${month}-${day}`;
};

const getStartMonth = (data) => {
  const year = data.getFullYear();
  const month = data.getMonth();
  const startMonth = new Date(year, month, 1);

  const startDay = String(startMonth.getDate()).padStart(2, "0");
  const startMonthStr = String(month + 1).padStart(2, "0");
  return `${year}-${startMonthStr}-${startDay}`;
};

const getEndMonth = (data) => {
  const year = data.getFullYear();
  const month = data.getMonth();
  const endMonth = new Date(year, month + 1, 0);

  const endDay = String(endMonth.getDate()).padStart(2, "0");
  const endMonthStr = String(month + 1).padStart(2, "0");
  return `${year}-${endMonthStr}-${endDay}`;
};

const diff_seconds = function(timestamp1, timestamp2) {
    const diff = timestamp1 - timestamp2;
    const daysDifference = diff/1000;

    return daysDifference;
}

module.exports = { getDate, getEndMonth, getStartMonth, diff_seconds };
