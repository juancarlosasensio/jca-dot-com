module.exports =  function (arr) {
  return arr.filter(note => note.categories.hasOwnProperty('Now') && !note.categories.hasOwnProperty('Notes'));
};