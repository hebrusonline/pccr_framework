window.onload = function(){
  let pres = document.querySelectorAll('#formOutput');
  for(let pre of pres){
    getSchema(pre);
  }

  let screens = document.querySelectorAll('.template');
  for(let screen of screens){
    let label = document.createElement('h2');
    label.classList.add('custom-label');
    label.innerHTML = 'Layout';
    screen.parentNode.insertBefore(label, screen);
  }

  let markups = document.querySelectorAll('.kss-markup>pre');
  for(let markup of markups){
    let label = document.createElement('h2');
    label.classList.add('custom-label');
    label.innerHTML = 'Template';
    markup.parentNode.insertBefore(label, markup);
  }

  let images = document.querySelectorAll('p>img');
  let image_count = 0;
  let image_labels = {
    0: 'An overview of the MVVM pattern',
    1: 'The three central UI components: Card, Input, App Screen',
    2: 'Structure of a Card Element',
    3: 'Structure of an Input Element',
    4: 'Observation of the Input Element',
    5: 'Structure of a Screen Element',
  };
  for(let image of images){
    image.parentNode.style.textAlign = 'center';
    let label = document.createElement('div');
    label.innerHTML = '<b>Image ' + (image_count+1) + ':</b> ' + image_labels[image_count];
    image.parentNode.insertBefore(label, image.nextSibling);
    image_count++;
  }

  try{
    let pageCardIcon = document.querySelector('.pageSelect-image');
    pageCardIcon.classList.add('fas', 'fa-times');
  }catch(e){
    console.log('oops');
  }

};

function getSchema(pre) {
  //==build request promise.====================================================
  return new Promise(function(resolve, reject) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          //--init 'response' --------------------------------------------------
          let response = null;
          //--parse JSON file to Object-----------------------------------------
          response = JSON.parse(httpRequest.responseText);
          pre.innerHTML = syntaxHighlight(httpRequest.responseText);
          //--resolve promise---------------------------------------------------
          resolve(response);
        }
      }
    };
    //--perform HTTP request.---------------------------------------------------
    httpRequest.open('GET', pre.getAttribute('src'));
    httpRequest.send();
  });
}

//==Highlight JSON syntax.
function syntaxHighlight (json) {
  if (typeof json != 'string') {
    json = JSON.stringify(json, undefined, 2);
  }
  let regEx = new RegExp(
    [
      '("(\\\\u[a-zA-Z0-9]{4}|\\\\[^u]|[^\\\\"])*"',
      '(\\s*:)?|\\b(true|false|null)\\b|',
      '-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?)'
    ].join(''),
    'g');
  json = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return json
    .replace(
      regEx,
      function(match) {
        let cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      });
}
