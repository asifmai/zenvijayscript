const exceltojson = require('xlsx-to-json-lc');
const path = require('path');
const fs = require('fs');

const inputFile = fs.readFileSync('sample.xlsx');
console.log(inputFile);

exceltojson({
    input: 'sample.xlsx',
    output: 'sample.json',
    sheet: "Sheet1"
  }, function(err, result) {
    if(err) {
      console.error(err);
    } else {
      console.log(result);
      //result will contain the overted json data
    }
  });