module.exports =  function (arr) {
  return arr.filter(note => note.categories.includes(785) && !note.categories.includes(67434));
};