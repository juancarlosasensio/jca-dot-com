const { DateTime } = require("luxon");

module.exports = (value) => {
  const dateObj = new Date(value);
  return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_FULL);
};