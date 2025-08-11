/**
 * Takes a string with HTML entities and decodes them to their character equivalents
 *
 * @param {String} str A string with HTML entities
 * @returns {String} the decoded string
 */
module.exports = (str) => {
  // First decode numeric HTML entities like &#160;
  let decoded = str.replace(/&#(\d+);/g, (match, charCode) => (    
    String.fromCharCode(charCode)
  ));
  
  // Then decode named HTML entities like &nbsp;
  const namedEntities = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&apos;': "'"
  };
  
  Object.keys(namedEntities).forEach(entity => {
    decoded = decoded.replace(new RegExp(entity, 'g'), namedEntities[entity]);
  });
  
  return decoded;
};