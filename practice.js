// const datefns = require('date-fns')
//
// var value = datefns.distanceInWordsStrict(
//   new Date(2019, 8, 31),
//   new Date(2019, 10, 18),
//   {unit: 'd'}
// )
//
// console.log(value);
// mysql://user:pass@host

const db = require('mysql')
.createConnection({
  host: '85.10.205.173',
  port: 3306,
  user: 'mohitsingh1930',
  password: 'techislife',
  database: 'test_database_v1'

})

var x = {val: 10};

var y = x;

console.log(x,y);

y.val = 20;

console.log(x,y);
