module.exports =  function (arr) {
  console.log('---------------from filters/nowPosts.js------------------');
  console.log({arr})
  return arr.filter(note => note.categories.hasOwnProperty('Now') && !note.categories.hasOwnProperty('Notes'));
};