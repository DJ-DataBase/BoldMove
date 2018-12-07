'use strict'

$('#search-button').on('click', function() {
  console.log('hello there');
  localStorage.clear();
  localStorage.setItem('city', JSON.stringify($('#search-input').val()));
});
