/**
* This code snippet scans the loacal storage of the curent page
* for all available items and stores them im a text file.
*
* The app previously needed to be loaded in offline mode.
*/
var archive = {},
  keys = Object.keys(localStorage),
  i = keys.length;

while ( i-- ) {
  archive[ keys[i] ] = localStorage.getItem( keys[i] );
}
console.log(archive);
var a = document.createElement('a');
var file = new Blob([JSON.stringify(archive)] , {type: 'text/plain'});
a.href = URL.createObjectURL(file);
a.download = 'app.pccr';
a.click();
