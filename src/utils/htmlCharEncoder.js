/**
 * Takes a collection and returns it back in display order
 *
 * @param {String} str A string with Unicode characters
 * @returns {String} the formatted collection
 */
module.exports = (str) => str.replace(/(&#(\d+);)/g, (match, capture, charCode) => (
  String.fromCharCode(charCode))
);