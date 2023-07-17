class DashItem extends HTMLElement {
  /**
   *Empty constructor.
   * @constructor
   */
  constructor() {
    const self = super();
  }

  initElement(metaData, appData) {
    this.app = appData;
    this.data = metaData;

    this.classList.add('dash--item');
    this.setTemplate();
  }

  setTemplate() {
    let promises = [];
    //==Create promise for template html file.
    promises
      .push(getFile('', 'dash-item.template', 'html'));
    //==Resolve promises made above.
    Promise.all(promises).then(function() {
      //==Add template structure to this.
      this.innerHTML = arguments[0][0][0].innerHTML;

      this.initData();
      //==Bind this context.
    }.bind(this));
  }

  initData() {
    //==Get the appmeta elements within the dash-item.==========================
    let language = this.querySelector('.dash-item__language img');
    let caption = this.querySelector('.dash-item__caption');
    let audience = this.querySelector('.dash-item__audience i');
    let content = this.querySelector('.dash-item__type i');
    let pages = this.querySelector('.dash-item__pages');

    //==Set the apropriate icons or values.=====================================
    //--The flag for the app language
    language.src = 'assets/' + this.data.language + '.png';

    //--The captoin of the App
    caption.innerHTML = this.data.caption;

    //--Target audience: 'adults', 'students', 'children', or ELSE (general)
    if (this.data.audience === 'adults') {
      audience.classList.add('fas');
      audience.classList.add('fa-user');
    }else if (this.data.audience === 'students') {
      audience.classList.add('fas');
      audience.classList.add('fa-user-graduate');
    }else if (this.data.audience === 'children') {
      audience.classList.add('fas');
      audience.classList.add('fa-child');
    }else{
      audience.classList.add('fas');
      audience.classList.add('fa-dot-circle');
    }

    //--content type: 'guide' or 'explore'
    if (this.data.content === 'guide') {
      content.classList.add('fas');
      content.classList.add('fa-binoculars');
    }else if (this.data.content === 'explore') {
      content.classList.add('fas');
      content.classList.add('fa-map-signs');
    }

    //--App size indicator: 'S', 'M', or 'L'
    if (Object.keys(this.app.pages).length < 5) {
      pages.innerHTML = 'S';
    }else if (Object.keys(this.app.pages).length < 10) {
      pages.innerHTML = 'M';
    }else if (Object.keys(this.app.pages).length > 10) {
      pages.innerHTML = 'L';
    }

    //==Add click listener to redirect to the App.==============================
    this.onclick = function(){
      localStorage.setItem('appSenderID', this.app.id);
      window.location.href = 'home.html';
    };
  }
}

/**
 * Function to request a file from the server: <b>JSON</b> or <b>HTML</b>.
 * @memberof Data
 *
 * @param {string} path - The directory path for the file to get.
 * @param {string} name - The name of the desired file.
 * @param {string} type - The file type extension ['json' or 'html'].
 *
 * @return {Promise}
 *         Get the file of <b>type</b> with <b>name</b> from <b>path</b>.
 */
function getFile(path, name, type){
  //==Returns a promise
  return new Promise(function(resolve, reject) {
    var httpRequest = new XMLHttpRequest();
    /**
     * Resolve HTTP request
     * @see {@link https://www.w3schools.com/js/js_ajax_http.asp|w3schools}
     */
    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          //==init 'response' variable
          let response = null;
          //==handle JSON file==============================================
          if (type === 'json') {
            //==parse JSON object
            response = JSON.parse(httpRequest.responseText);
          }
          //==handle HTML file==============================================
          if (type === 'html') {
            let parser = new DOMParser();
            //==parse HTML DOM to get template via querySelector
            response = parser
              .parseFromString(httpRequest.responseText, 'text/html')
              .querySelectorAll('.template');
          }
          //==Resolve given promise.
          resolve(response);
        }
      }
    };
    //==Build 'target' string.
    let target = path + name + '.' + type;
    console.log(name);

    //==Send out HTTP request.
    httpRequest.open('GET', target);
    httpRequest.send();
  });
}
