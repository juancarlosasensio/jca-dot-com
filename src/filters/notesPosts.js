module.exports =  (arr) => {
  return arr.filter(note => note.categories.hasOwnProperty('Notes'));
};