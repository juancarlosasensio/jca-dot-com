module.exports =  function (arr) {
  return arr.filter(note => note.categories.hasOwnProperty('Notes') && !note.categories.hasOwnProperty('Now'));
};