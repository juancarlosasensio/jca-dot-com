const { DateTime } = require("luxon");

module.exports = (dateObj) => {
  return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_FULL);
};