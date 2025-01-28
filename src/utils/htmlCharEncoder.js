/**
 * Takes a collection and returns it back in display order
 *
 * @param {String} str A string with Unicode characters
 * @returns {String} the formatted collection
 */
const htmlEntities = {
  '&nbsp;': ' ',
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&quot;': '"',
  '&apos;': "'"
};

module.exports = (str) => str.replace(/(&#(\d+);|&[a-z]+;)/g, (match, capture, charCode) => {
  if (charCode) {
    return String.fromCharCode(charCode);
  }
  return htmlEntities[match] || match;
});