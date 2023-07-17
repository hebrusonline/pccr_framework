//==============================================================================
/**
* @file This File defines the central consumer application's behavior of the PCCR-Framework. <br>
* Icon source for country flags: @see  {@link https://www.iconfinder.com/iconsets/flags_gosquared|iconfinder}
* <pre>
*
*==Method List:================================================================================================== <br>
* | Name                     | Description                                                                          |
* -------------------------- | ---------------------------------------------------------------------------          |
* | [getImageFile]{@link ConsumerApp.Offline.getImageFile}             | Function to create a BLOB for the desired medium.                                    |
* | [putImageInDb]{@link ConsumerApp.Offline.putImageInDb}             | Function to put the blob in the indexedDB of the browser.                            |
* | [getImageFromDb]{@link ConsumerApp.Offline.getImageFromDb}           | Function to get the BLOB from the indexedDB.                                         |
* | [createRequest]{@link ConsumerApp.Offline.createRequest}            | Function to create a request-Object for the indexedDB.                               |
*
* | [loadAllPages]{@link ConsumerApp.Main.loadAllPages}             | Function to load all included resources from the server and store it locally.        |
* | [loadAppData]{@link ConsumerApp.Main.loadAppData}              | Function to get the app data document from the database.                             |
* | [getAppData]{@link ConsumerApp.Main.getAppData}               |  Function to retrieve the app's data document.                                       |
* | [getCreatorData]{@link ConsumerApp.Main.getCreatorData}           | Function to retrieve the app creator data document.                                  |
* | [displayPage]{@link ConsumerApp.Main.displayPage}              | Function to display da page on screen.                                               |
* | [getPageTemplate]{@link ConsumerApp.Main.getPageTemplate}          | Function to retrieve the app page template.                                          |
* | [getConfigFile]{@link ConsumerApp.Main.getConfigFile}            | Function to retrieve app config file.                                                |
* | [getLabels]{@link ConsumerApp.Main.getLabels}                | Function to get the labels to display in the appropriate language.                   |
* | [getPageData]{@link ConsumerApp.Main.getPageData}              | Function to retrieve the data for a certain page.                                    |
* | [toDataURL]{@link ConsumerApp.Main.toDataURL}                | Function to convert download URL to data URL.                                        |
* | [setBackTarget]{@link ConsumerApp.Main.setBackTarget}            | Function to set the back target for in-app navigation.                               |
* | [addToNavigation]{@link ConsumerApp.Main.addToNavigation}          | Function to add element to navbar cotainer.                                          |
* | [startTour]{@link ConsumerApp.Main.startTour}                | Function to start a tour in guide mode.                                              |
* | [resumeTour]{@link ConsumerApp.Main.resumeTour}               | Function to resume a tour in guide mode.                                             |
* | [explorePage]{@link ConsumerApp.Main.explorePage}              | Function to display requested page in explore mode.                                  |
* | [createNavIcon]{@link ConsumerApp.Main.createNavIcon}            | Function to create a navigation icon.                                                |
* | [showQuestion]{@link ConsumerApp.Main.showQuestion}             | Function to show a question in a quiz.                                               |
* | [evalData]{@link ConsumerApp.Main.evalData}                 | Function to evaluate the data according to the ViewModel to produce the page view.   |
* | [Object.size]{@link ConsumerApp.Main.Object.size}              | Enable size function on generic objects.                                             |
* | [setIndicator]{@link ConsumerApp.Main.setIndicator}             | Function to set the date indicator element.                                          |
* </pre>
* @author       Hebrus
*
* @see {@link ConsumerApp.Main} - The ConsumerApp namespace.
*/
//==============================================================================

//GLOBALS
let appData = {};
let cubeData = {};
let labels = {};
let icons = {};
let currentPage = 0;
let pageHeight = 0;

/**
 * The ConsumerApp.Main namespace.
 * @namespace ConsumerApp.Main
 */

let __CONFIG = {};



//==============================================================================

/**
 * The Offline namespace.
 * @namespace
 */
let Offline = {};

(function(){

  //==============================================================================
  /**
  *  Function to create a BLOB for the desired medium. <br>
  *
  * @param {string} url - The firebase download URL for the image.
  * @param {string} pageId - The PageId for the page containing the image.
  * @param {string} mediaRef - The Firebase reference ID for the image.
  *
  * @memberof ConsumerApp.Offline
  * @async
  */
  let getImageFile =
    async function (url, pageId, mediaRef) { console.log(url, pageId, mediaRef);
      console.log('Get image BLOB.');
      //=Create XHR.
      var xhr = new XMLHttpRequest();
      var  blob;

	if(!url){
		  let storageRef = firebase.storage().ref();
          let imageRef = storageRef.child(mediaRef);
          url = await imageRef.getDownloadURL();
		  console.log(url);
	}

      xhr.open('GET', url, true);
      //==Set the responseType to BLOB.
      xhr.responseType = 'blob';

      xhr.addEventListener('load', function () {
        if (xhr.status === 200) {
          //--Blob as response-
          blob = xhr.response;
          //--Put the received blob into IndexedDB.
          putImageInDb(blob, pageId, mediaRef);
        }
      }, false);
      //--Send XHR.
      xhr.send();
    };

  //==============================================================================
  /**
  *  Function to put the blob in the indexedDB of the browser. <br>
  *
  * @param {BLOB} blob - The the image blob.
  * @param {string} pageId - The PageId for the page containing the image.
  * @param {string} mediaRef - The Firebase reference ID for the image.
  *
  * @memberof ConsumerApp.Offline
  * @private
  * @async
  */
  let putImageInDb =
    async function (blob, pageId, mediaRef) {
      console.log('Put BLOB in DB.');
      //==Create database reference.
      let request = createRequest();

      //@override
      request.onsuccess = function (event) {
        let database = request.result;

        //--Create a transaction to the 'images'-database.
        var transaction = database.transaction(['images'], 'readwrite');

        //--Put the blob into the dabase.
        var put = transaction.objectStore('images').add(blob, mediaRef);

        //--The transaction has completed.
        transaction.oncomplete = function(event) {
          console.log('All done!');

          getImageFromDb(pageId, mediaRef);
        };

        //--The transactions has failed (key already exists).
        transaction.onerror = function(event) {
          console.log('Error: ',event);

          getImageFromDb(pageId, mediaRef);
        };

        //--Database error.
        database.onerror = function (event) {
          console.log('Error creating/accessing IndexedDB database');
        };
      };
    };

  //==============================================================================
  /**
  * Function to get the BLOB from the indexedDB. <br>
  *
  * @param {string} pageId - The PageId for the page containing the image.
  * @param {string} mediaRef - The Firebase reference ID for the image.
  *
  * @memberof ConsumerApp.Offline
  * @async
  */
  let getImageFromDb =
    async function(pageId, mediaRef){
      console.log('Get BLOB from DB.');
      //==Return the promise to be resolved.
      return new Promise(
        function(resolve, reject){
          //--Create a database request.
          let request = createRequest();

          //@override
          request.onsuccess = function (event) {
            let database = request.result;

            //--Create a transaction to the 'images'-database.
            var transaction = database.transaction(['images'], 'readonly');

            //--Get the image BLOB.
            transaction.objectStore('images').get(mediaRef).onsuccess = function (event) {
              var imgFile = event.target.result;
              console.log('Got image:' + imgFile);
			  
			  if(imgFile === undefined){
				  resolve(undefined);
			  }else{
				
              //-Get window.URL object.
              var URL = window.URL || window.webkitURL;

              //-Create image URL.
              var imgURL = URL.createObjectURL(imgFile);

              if(pageId){
                //-Get current page.
                let currentPage = JSON.parse(localStorage.getItem(pageId));
                console.log(currentPage);
                for(media in currentPage.media){
                  if(currentPage.media[media].ref == mediaRef){
                    currentPage.media[media].blobRef = imgURL;
                    currentPage.media[media].blob = true;
                  }
                }

                if(currentPage.image && currentPage.image.image_path == mediaRef){
                  currentPage.image.blobRef = imgURL;
                  currentPage.image.blob = true;
                }

                if(currentPage.logo && currentPage.logo.image_path == mediaRef){
                  currentPage.logo.blobRef = imgURL;
                  currentPage.logo.blob = true;
                }

                localStorage.setItem(pageId, JSON.stringify(currentPage));
                //--Resolve promise by sending image URL.
              }

              resolve(imgURL);
			  }
            };

            transaction.oncomplete = function(event) {
              console.log('All done!');
            };

            transaction.onerror = function(event) {
              console.log('Error!');
              console.log(event);
            };

            database.onerror = function (event) {
              console.log('Error creating/accessing IndexedDB database');
            };
          };
        }
      );
    };

  //==============================================================================
  /**
  * Function to create a request-Object for the indexedDB. <br>
  *
  * @return {Object} The request-Object.
  *
  * @memberof ConsumerApp.Offline
  * @private
  */
  let createRequest =
    function(){
      let dbVersion = 1.0;
      let request = indexedDB.open('imageFiles', dbVersion);
      let database;

      request.onerror = function (event) {
        console.log('Error creating/accessing IndexedDB database');
      };

      request.onsuccess = function (event) {
        console.log('Success creating/accessing IndexedDB database');
        database = request.result;

        database.onerror = function (event) {
          console.log('Error creating/accessing IndexedDB database');
        };
      };

      request.onupgradeneeded = function (event) {
        event.target.result.createObjectStore('images');
      };

      return request;
    };

  //==Provide
  this.getImageFile = getImageFile; //(url, pageId, mediaRef)
  this.getImageFromDb = getImageFromDb; //(pageId, mediaRef)

}).apply(Offline);


//==============================================================================
//==============================================================================

//==============================================================================
/**
* Onload
*/
(async function() {
  console.log('Load...');
  //==Define the service worker (sw_cache_pages.js) for offline capabilites, if possible.
  if('serviceWorker' in navigator){
    console.log('Service Worker available!');
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('sw_cache_pages.js')
        .then(reg => console.log('Service Worker: Registered'))
        .catch(err => console.log(`Service Worker: Error: ${err}`));
    });
  }
  //==Get config file, containig the necesary API information.
  __CONFIG = await getConfigFile();

  try {
    //==Add credentials for the maps API.
    let mapsScript = document.createElement('script');
    mapsScript.setAttribute('src', __CONFIG.maps.src);
    document.querySelector('body').appendChild(mapsScript);
    //==Initialize Firebase.
    const config = __CONFIG.firebase.config;
    firebase.initializeApp(config);

    //==RESOLVED WARNING: 'changed date format' - API Firebase error!
    const firestore = firebase.firestore();
    const settings = {
      timestampsInSnapshots: true
    };
    firestore.settings(settings);
  } catch (e) {
    console.log('Error: ', e);
  }

  //==Retrieve ID of the app about to be displayed.
  let appID = localStorage.getItem('appSenderID');
  //==Get the app JSON if stored locally.
  if(localStorage.getItem(appID)){
	appData = JSON.parse(localStorage.getItem(appID));
  }else{
	appData = await getAppData(appID);
	localStorage.setItem(appID, JSON.stringify(appData));
  }
  
  console.log(appData);

  //==Get the creator JSON.
  creatorData = await getCreatorData(appData.user);
  console.log(creatorData);

  //==Save origin ID for analytics.
  localStorage.setItem('appOriginID', appData.id);

  //==Display the landing page.
  displayPage('appmeta', appData.appmeta);

  //==Initialize page analytics.
  Analytics.initialize(appData.user, appID);

  //==Prevent moving of content, when native keyboard is displayed.=============
  pageHeight = window.innerHeight;
  console.log(pageHeight);

  window.onresize = function(){
    console.log(document.querySelector('body').getAttribute('type'));
    if(pageHeight > window.innerHeight * 1.25 ){
      if (document.querySelector('body').getAttribute('type') === 'appmeta') {
        document.querySelector('#app__header').classList.add('hidden');
        document.querySelector('#app__footer').classList.add('hidden');
        document.querySelector('#content-box').classList.add('keyboard');
      }
    }else{
      if (document.querySelector('body').getAttribute('type') === 'appmeta') {
        document.querySelector('#app__header').classList.remove('hidden');
        document.querySelector('#app__footer').classList.remove('hidden');
        document.querySelector('#content-box').classList.remove('keyboard');
      }
    }
  };
  
  //==Get app content & preload all pages and resources, if 'offline' flag is NOT already set for page.
  if (__CONFIG.offline === true && appData.offline != true) {
    loadAllPages();
  }
  
  //src: https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
  // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
  let vh = window.innerHeight * 0.01;
  // Then we set the value in the --vh custom property to the root of the document
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}());


//==============================================================================
/**
* Function to load all included resources from the server and store it locally. <br>
*
* Recursively downloads every page needed for the app to function properly. <br>
*
* Converts images to base64 code to save as a string.                       <br>
* @see {@link https://stackoverflow.com/questions/19183180/how-to-save-an-image-to-localstorage-and-display-it-on-the-next-page|Stackoverflow}
*
* @memberof ConsumerApp.Main
* @async
*/
async function loadAllPages(){
  console.log(appData);

  //==Load included basic pages.
  if(appData.basic.admission){
    getPageData('admission', appData.basic.admission);
  }
  if(appData.basic.hours){
    getPageData('hours', appData.basic.hours);
  }
  if(appData.basic.info){
    getPageData('info', appData.basic.info);
  }

  //==Load leaga page.

  //==Load included advanced & specialized pages.
  //--Loop through pages object.
  for(page in appData.pages){
    console.log(appData.pages[page]);
    //--Load page data.
    let pageData = await getPageData(
      appData.pages[page].type,
      appData.pages[page].id
    );
    //--Check if page is cube page.
    if(appData.pages[page].type === 'cube'){
      //-Load base page information.
      getPageData(
        pageData.basePage.type,
        pageData.basePage.id
      );
      //-Check for interacton page.
      if (pageData.interact) {
        //-Load interaction page information.
        getPageData(
          pageData.interact.type,
          pageData.interact.id
        );
      }
      //-Check for media page.
      for(media in pageData.media){
        console.log('Check medium: ', pageData.media[media]);
        //Check if image is already available as base64.
        if(!pageData.media[media].blob){
          //Get firebase image URL.
          let storageRef = firebase.storage().ref();
          let imageRef = storageRef.child(pageData.media[media].ref);
          let url = await imageRef.getDownloadURL();

          pageData.media[media].url = url;

          Offline.getImageFile(
            url,
            appData.pages[page].id,
            pageData.media[media].ref
          );
          //### Offline.getImageFromDb(pageId, mediaRef);
        }
      }
      //-Check for related pages.
      for(relatedPage in pageData.relatedPages){
        getPageData(
          pageData.relatedPages[relatedPage].type,
          pageData.relatedPages[relatedPage].id
        );
      }
      //-Save cube page locally.
      localStorage.setItem(
        appData.pages[page].id,
        JSON.stringify(pageData)
      );
    }
  }
  //==Set offline flag in local storage.
  appData.offline = true;
  
  localStorage.setItem(appData.id , JSON.stringify(appData));
}

//==============================================================================
/**
* Function to get the app data document from the database.
* @async
*
* @param {string} appID - The app ID.
*
* @memberof ConsumerApp.Main
*/
async function loadAppData(appID){
  var database = firebase.firestore();
  let doc = {};
  try {
    doc = await database
      .collection(__CONFIG.appfolder)
      .doc(appID)
      .get();
  } catch (e) {
    console.log('ERROR:', e);
  }
  let app = doc.data();
  console.log(app);
  //==Locally update app id to appSenderID.
  app.id = appID;
  localStorage.setItem('appData', JSON.stringify(app));
  return app;
}

//==============================================================================
/**
* Function to retrieve the app's data document.
* @async
*
* @param {string} appID - The app ID.
*
* @memberof ConsumerApp.Main
*/
async function getAppData(appID) {
  console.log(appID);
  //==Check if appData document is available locally.
  if(JSON.parse(localStorage.getItem('appData'))){
    //==Check if appID matches sthe stored one and if offline flag is set.
    if(JSON.parse(localStorage.getItem('appData')).id === appID && __CONFIG.offline){
      //==Return the stored app data.
      return JSON.parse(localStorage.getItem('appData'));
    }else{
      return loadAppData(appID);
    }
  }else{
    return loadAppData(appID);
  }
}

//==============================================================================
/**
* Function to retrieve the app creator data document.
* @async
*
* @param {string} creatorID - The app creator ID.
*
* @memberof ConsumerApp.Main
*/
async function getCreatorData(creatorID) {
  console.log(__CONFIG);
  //==Check if creator data is already available.
  if (localStorage.getItem('creatorData')
  && localStorage.getItem('creatorData').id === creatorID && __CONFIG.offline) {
    return JSON.parse(localStorage.getItem('creatorData'));
  }else{
    //==Get creator data document from database.
    var database = firebase.firestore();
    let docs = {};
    try {
      docs = await database
        .collection(creatorID)
        .doc('user-info')
        .collection('basic-info')
        .get();

    } catch (e) {
      console.log('ERROR:', e);
    }
    let info = {};
    docs.forEach(function(doc){
      info = doc.data();
    });
    //--Set creator data document.
    localStorage.setItem('creatorData', JSON.stringify(info));
    return info;
  }
}

//==============================================================================
/**
* Function to display a page on screen.                                    <br>
* Perform the necessary action to transform the data to conform to the view.
* @async
*
* @param {string} pageType - The page type.
* @param {string} pageId - The page ID.
* @param {boolean} [isCube=false] - Indicates if page is a cube page or not.
* @param {string} [direction='none'] - Indicates the navigation direction ('left' or 'right').
*
* @memberof ConsumerApp.Main
*/
async function displayPage(pageType, pageId, isCube = false, direction = 'none') {
  console.log('Display the page with ID %s of type %s', pageId, pageType);
  //==Reset cube data.==========================================================
  if (!isCube) {
    cubeData = {};
  }
  //==Process regular page.
  if(pageType != 'cube'){
    console.log('Display a Page');
    //--Get page data document.
    let data = await getPageData(pageType, pageId);

    //--Get page template.
    let page = await getPageTemplate(pageType, data);

    //--Get & prepare the page body element.
    let body = document.querySelector('body');
    let currentPageType = body.getAttribute('type');
    let currentPageId = body.getAttribute('page_id');

    body.setAttribute('type', pageType);
    body.setAttribute('layout', data.layout);
    body.setAttribute('page_id', pageId);

    //--Prepare page view.
    await evalData(data, page, body);

    //==HOURS PAGE==============================================================
    if(pageType === 'hours'){
      console.log(body.querySelector('#app__body').childNodes);
      let weekDay = new Date().getDay()-1;
      //=Account for zero based array.
      if(weekDay === -1){
        weekDay = 6;
      }
      //=Identify & highlight current day.
      body.querySelector('#app__body')
        .querySelectorAll('.hours_day')[weekDay]
        .querySelector('.weekday').style.fontWeight = '900';

      //=Get fields in view.
      let opening_times = body.querySelector('#app__body')
        .querySelectorAll('#opening_time');
      let closing_times = body.querySelector('#app__body')
        .querySelectorAll('#closing_time');

      //=Set data in view.
      for (let i = 0; i < opening_times.length; i++) {
        if (opening_times.item(i).innerHTML != undefined) {
          opening_times.item(i).innerHTML =
            opening_times.item(i).innerHTML.slice(0, -3);
          closing_times.item(i).innerHTML =
            closing_times.item(i).innerHTML.slice(0, -3);
        }
      }
    }

    //==APPMETA=================================================================
    if(pageType === 'appmeta'){
      //--Setup colour schema.--------------------------------------------------
      let colour = 'default';
      if(data.colour){
        if(data.colour === 'blue'){
          colour = 'LB';
        }else
        if(data.colour === 'green'){
          colour = 'LG';
        }else
        if(data.colour === 'orange'){
          colour = 'DO';
        }else{
          colour = 'default';
        }
      }

      document.documentElement.style
        .setProperty('--background-colour',
          'var(--background-colour-' + colour + ')');
      document.documentElement.style
        .setProperty('--header-colour',
          'var(--header-colour-' + colour + ')');
      document.documentElement.style
        .setProperty('--shadow-colour',
          'var(--shadow-colour-' + colour + ')');
      document.documentElement.style
        .setProperty('--inactive-colour',
          'var(--inactive-colour-' + colour + ')');
      document.documentElement.style
        .setProperty('--gradient-colour',
          'var(--background-colour-' + colour + ')');
      document.documentElement.style
        .setProperty('--panel-colour',
          'var(--background-colour-' + colour + ')');

      //--Offer to resume the tour.---------------------------------------------
      if (data.content === 'guide') {
        appData.content = 'guide';
        if(currentPage != 0){
          document.querySelector('#btn__resume-tour').classList.remove('hidden');
        }else{
          document.querySelector('#btn__resume-tour').classList.add('hidden');
        }
      }else{
        appData.content = 'explore';
      }

      //==Show only active pages in footer navigation.==========================
      let icons = document
        .querySelector('#app__footer')
        .querySelectorAll('.nav__icon');
      //=Hide those elements.---------------------------------------------------
      icons[0].style.display = 'none';
      icons[1].style.display = 'none';
      icons[2].style.display = 'none';
      //=Show available elements.-----------------------------------------------
      if(appData.basic.admission){
        icons[2].style.display = 'grid';
      }
      if(appData.basic.hours){
        icons[1].style.display = 'grid';
      }
      if(appData.basic.info){
        icons[0].style.display = 'grid';
      }
      //=Add legal page to info.------------------------------------------------
      let container = createNavIcon('legal');
      container.onclick = function(){
        displayPage('legal' , 'none');
      };
      addToNavigation(container);
    }

    //==BASIC PAGES=============================================================
    if(pageType === 'info'
      || pageType === 'hours'
      || pageType === 'admission'
      || pageType === 'legal'){
      //==BACK------------------------------------------------------------------
      setBackTarget(currentPageType, currentPageId);

      //--INFO PAGE-------------------------------------------------------------
      if(pageType === 'info'){
        let container = createNavIcon('legal');
        container.onclick = function(){
          displayPage('legal' , 'none');
        };
        addToNavigation(container);
      }
    }else if(
      appData.content === 'guide'
      && (['text', 'object', 'person', 'event', 'place', 'room', 'quiz'].includes(pageType)))
    {
      //==PREVIOUS PAGE---------------------------------------------------------
      let container = createNavIcon('left');

      if(currentPage != 0){
        container.onclick = function(){
          currentPage = currentPage - 1;
          displayPage(
            appData.pages[currentPage].type ,
            appData.pages[currentPage].id,
            false,
            'left');
        };
      }else{
        //--Set button inactive if all the way left.----------------------------
        container.classList.add('inavtive');
      }
      addToNavigation(container);

      //==HOME PAGE-------------------------------------------------------------
      container = createNavIcon('home');
      container.onclick = function(){
        displayPage('appmeta', appData.appmeta);
      };
      addToNavigation(container);

      //==NEXT PAGE-------------------------------------------------------------
      container = createNavIcon('right');

      if(currentPage != Object.keys(appData.pages).length - 1){
        container.onclick = function(){
          currentPage = currentPage + 1;
          displayPage(
            appData.pages[currentPage].type ,
            appData.pages[currentPage].id,
            false,
            'right');
        };
      }else{
        //--Set button inactive if all the way right.---------------------------
        container.classList.add('inavtive');
      }
      addToNavigation(container);
    }else if(
      appData.content === 'explore'
      && (['text', 'object', 'person', 'event', 'place', 'room', 'quiz'].includes(pageType)))
    {
      //==HOME PAGE-------------------------------------------------------------
      container = createNavIcon('home');
      container.onclick = function(){
        displayPage('appmeta', appData.appmeta);
      };
      addToNavigation(container);
    }
  }else{
    console.log('It\'s a cube.');
    cubeData = await getPageData(pageType, pageId);

    await displayPage(cubeData.basePage.type, cubeData.basePage.id, true);

    let cubePane = document.createElement('div');
    cubePane.classList.add('cube-pane');
    let cubeFooter = document.createElement('div');
    cubeFooter.classList.add('cube-footer');

    //==Add cube navigation elements.
    let footer = document.querySelector('#app__footer');

    let addContainer = undefined;

    //==Check if interaction exist.=============================================
    if(cubeData.interact){
      console.log('CUBE INTERACT');
      //==Create navigation element.--------------------------------------------
      addContainer = createNavIcon('top');
      //==Add click listener to navigation.-------------------------------------
      addContainer.onclick = async function(){
        console.log('top');

        let down_div = document.createElement('div');
        down_div.classList.add('animation_down');
        document.querySelector('#app__body').appendChild(down_div);

        //==Fet question.=======================================================
        let question = await getPageData('question', cubeData.interact.id);
        //==Get template.=======================================================
        let questTemplate = await getPageTemplate('question', question);
        questTemplate = questTemplate.querySelector('body').innerHTML;

        //==Randomize answers.==================================================
        let answers = [];
        let put_right = Math.floor(Math.random() * (4));
        let number_wrong = 0;
        for(let i=0;i<4;i++){
          if(i === put_right){
            answers.push(question.right);
          }else{
            number_wrong++;
            answers.push(question['false_'+ number_wrong]);
          }
        }

        //==Get the target DOM element in document.=============================
        let questBox = cubePane;
        questBox.id = 'question-box';
        //==Get the template and put data in place.=============================
        questTemplate = eval('`' + questTemplate + '`');
        questBox.innerHTML = questTemplate;

        //==Show the element.===================================================
        questBox.style.display = 'grid';

        //==Get the answer elements.============================================
        let answerBoxes = questBox.querySelectorAll('.answer');
        //==Add the click listener.=============================================
        for(let box of answerBoxes){
          box.onclick = function(e){
            let isRight = false;
            if(e.target.innerHTML === answers[put_right]){
              isRight = true;
            }
            //--In case of right answer.
            if(isRight){
              box.classList.add('right');
              //==User feedback for answered question.--------------------------
              setTimeout(function(){
                console.log('down');

                let up_div = document.createElement('div');
                up_div.classList.add('animation_up');
                document.querySelector('#app__body').appendChild(up_div);

                questBox.id = '';
                //--Remove list and cube navigation.----------------------------
                document.querySelector('#app__body').removeChild(cubePane);

                //--Show app navigation.----------------------------------------
                document.querySelector('#app__footer').classList.remove('hidden');
              }, 1000);
            }else{
              box.classList.add('wrong');
              //==User feedback for answered question.==========================
              setTimeout(function(){
                box.classList.remove('wrong');
              }, 1000);
            }
          };
        }

        //--Add quiz to view.---------------------------------------------------
        document.querySelector('#app__body').appendChild(cubePane);
        //--Hide app footer.----------------------------------------------------
        document.querySelector('#app__footer').classList.add('hidden');
      };
      //==Add navigation element to footer.-------------------------------------
      let pos = 1;
      if(appData.content === 'explore'){
        pos = 0;
      }
      footer.insertBefore(addContainer, footer.children[pos]);
    }else{
      //==Keep footer symmetry with dummy element.==============================
      addContainer = createNavIcon('top');
      addContainer.classList.add('hidden');

      let pos = 1;
      if(appData.content === 'explore'){
        pos = 0;
      }
      footer.insertBefore(addContainer, footer.children[pos]);
    }

    //==Check if related pages exist.===========================================
    if(cubeData.relatedPages.length > 0){

      //==Create navigation element.--------------------------------------------
      addContainer = createNavIcon('bottom');
      footer.insertBefore(addContainer, footer.children[3]);

      //==Add click listener to navigation.-------------------------------------
      addContainer.onclick = async function(){
        console.log('bottom');

        let up_div = document.createElement('div');
        up_div.classList.add('animation_up');
        document.querySelector('#app__body').appendChild(up_div);

        cubePane.id = 'related-list';
        cubePane.style.display = 'block';
        //Create list of related pages.-----------------------------------------
        cubePane.innerHTML = '';
        let cubePages = [];
        for (var i = 0; i < cubeData.relatedPages.length; i++) {
          cubePages.push(
            await getPageData(cubeData.relatedPages[i].type
              , cubeData.relatedPages[i].id));

          cubePages[i].id = cubeData.relatedPages[i].id;
          cubePages[i].type = cubeData.relatedPages[i].type;

          let listItem = document.createElement('div');
          listItem.classList.add('related-item');
          let itemTemplate =
          `
          <i class="fa-2x ${icons[cubePages[i].type][0]} ${icons[cubePages[i].type][1]}"></i>
          <div>${cubePages[i].name}</div>
          `;

          listItem.innerHTML = itemTemplate;
          listItem.data = cubePages[i];
          listItem.onclick = async function(e){
            console.log(e);
            //==Get list item.--------------------------------------------------
            let listItem = e.target;
            console.log(listItem);
            while(!listItem.classList.contains('related-item')){
              listItem = listItem.parentNode;
            }

            //==Get template.
            let data = listItem.data;
            let page = await getPageTemplate(data.type, data);

            let singleCubePage = document.createElement('body');
            singleCubePage.classList.add('single-cube-page');

            singleCubePage.setAttribute('type', data.type);
            singleCubePage.setAttribute('layout', data.layout);

            await evalData(data, page, singleCubePage);

            let footer = singleCubePage.querySelector('#app__footer');
            let closeNav = createNavIcon('close');
            closeNav.onclick = function(){
              cubePane.id = '';
              console.log('close');
              document.querySelector('body')
                .removeChild(document.querySelector('.single-cube-page'));
            };
            footer.appendChild(closeNav);
            //==Create overlay page (w/o footer).
            document.querySelector('body').appendChild(singleCubePage);
          };
          //--Add list-item to related pages list.
          cubePane.appendChild(listItem);
        }

        //--Add list to view.---------------------------------------------------
        document.querySelector('#app__body').appendChild(cubePane);
        //--Create navigation back to cube basePage.----------------------------
        let moveUp = createNavIcon('top');
        //--Add navigation click listner.---------------------------------------
        moveUp.onclick = function(){
          console.log('top');

          let down_div = document.createElement('div');
          down_div.classList.add('animation_down');
          document.querySelector('#app__body').appendChild(down_div);

          //--Remove list and cube navigation.----------------------------------
          document.querySelector('#app__body').removeChild(cubePane);
          document.querySelector('body').removeChild(cubeFooter);
          cubeFooter.innerHTML = '';
          //--Show app navigation.----------------------------------------------
          document.querySelector('#app__footer').classList.remove('hidden');
        };
        //--Add click listner to cube navigation.-------------------------------
        cubeFooter.appendChild(moveUp);

        //--Exchange app with cube navigation.----------------------------------
        document.querySelector('body')
          .insertBefore(cubeFooter,document.querySelector('#app__footer'));
        document.querySelector('#app__footer').classList.add('hidden');
      };
      //==Add navigation element to footer.-------------------------------------

    }else{
      //==Keep footer symmetry with dummy element.==============================
      addContainer = createNavIcon('bottom');
      addContainer.classList.add('hidden');
      footer.insertBefore(addContainer, footer.children[3]);
    }

    //==Check if media exists.==================================================
    if(cubeData.media.length > 0){
      console.log('CUBE MEDIA');
      //==Create navigation element.--------------------------------------------
      addContainer = createNavIcon('behind');
      addContainer.classList.add('fab');

      //==Add click listener to navigation.-------------------------------------
      addContainer.onclick = async function(){
        console.log('behind');

        let flip_div = document.createElement('div');
        flip_div.classList.add('animation_flip');
        document.querySelector('#app__body').appendChild(flip_div);

        //==Create gallery.------------------------------------------------------
        let imageGallery = document.createElement('div');
        imageGallery.classList.add('image-galery');

        //==Add media objects to gallery========================================
        for(let entry in cubeData.media){
          console.log(entry);
          //==check allowed types===============================================
          if(cubeData.media[entry].type === 'image'){
            //==Add to gallery.-------------------------------------------------
            let imageBox = document.createElement('div');
            imageBox.classList.add('gallery__img');
            let newImage = document.createElement('img');

            //==Check if image blob exists in indexedDB.------------------------
            if(cubeData.media[entry].blob){
              //--Replace firebase-URL with BLOB-URL.
              let url = await Offline.getImageFromDb(pageId, cubeData.media[entry].ref);
			  if(url === undefined){
				  await Offline.getImageFile(false, false, cubeData.media[entry].ref);
				  url = await Offline.getImageFromDb(pageId, cubeData.media[entry].ref);
			  }
			  
              console.log('Call after EXECUTED');
              newImage.src = url;
            }else{
              newImage.src = cubeData.media[entry]?.url;
            }

            //==Increase image size on click.-----------------------------------
            newImage.onclick = e => fullSize(e);

            imageBox.appendChild(newImage);

            imageGallery.appendChild(imageBox);
          }
        }
        //--Add gallery to view.------------------------------------------------
        document.querySelector('#app__body').appendChild(imageGallery);
        //--Create close media navigation.--------------------------------------
        let closeMedia = createNavIcon('close');
        //--Add navigation click listner.---------------------------------------
        closeMedia.onclick = function(){
          console.log('close');

          let flip_div = document.createElement('div');
          flip_div.classList.add('animation_flip_re');
          document.querySelector('#app__body').appendChild(flip_div);

          //--Remove gallery and cube navigation.-------------------------------
          document.querySelector('#app__body').removeChild(imageGallery);
          document.querySelector('body').removeChild(cubeFooter);
          cubeFooter.innerHTML = '';
          //--Show app navigation.----------------------------------------------
          document.querySelector('#app__footer').classList.remove('hidden');
        };
        //--Add click listner to cube navigation.-------------------------------
        closeMedia.classList.add('fab');
        cubeFooter.appendChild(closeMedia);

        //--Exchange app with cube navigation.----------------------------------
        document.querySelector('body')
          .insertBefore(cubeFooter,document.querySelector('#app__footer'));
        document.querySelector('#app__footer').classList.add('hidden');
      };
      //==Add navigation element to footer.-------------------------------------
      footer.appendChild(addContainer);
    }
  }

  Analytics.logPage(pageType, pageId);

  //==Add progress bar for guide.===============================================
  if (
    appData.content === 'guide'
    && (!['appmeta', 'info', 'hours', 'admission', 'legal'].includes(pageType)))
  {
    let progressBar = document.createElement('div');
    progressBar.classList.add('progress-bar');

    //==Add bar segment for each page available.
    for (var i = 0; i < Object.entries(appData.pages).length; i++) {
      let bar = document.createElement('div');
      bar.classList.add('bar');
      progressBar.appendChild(bar);
      //--Indicate current page in the progress bar.
      if (i === currentPage) {
        bar.classList.add('current');
      }
    }
    document.querySelector('body').appendChild(progressBar);
  }

  //-Add animation for left & right, if in guide mode.
  if(direction === 'left'){
    let left_div = document.createElement('div');
    left_div.classList.add('animation_left');
    document.querySelector('#app__body').appendChild(left_div);
  }

  if(direction === 'right'){
    let right_div = document.createElement('div');
    right_div.classList.add('animation_right');
    document.querySelector('#app__body').appendChild(right_div);
  }
}

//==============================================================================
/**
* Function to retrieve the app page template.                               <br>
* @async
*
* @param {string} pageType - The page type.
* @param {object} data - The page data object
*
* @memberof ConsumerApp.Main
*/
async function getPageTemplate(pageType, data) {
  //==Build request promise.====================================================
  let template = new Promise(function(resolve, reject) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          //--Init 'response'.--------------------------------------------------
          let response = null;
          //--Handle HTML file.-------------------------------------------------
          let parser = new DOMParser();
          //--Parse into HTML DOM.----------------------------------------------
          response = parser
            .parseFromString(httpRequest.responseText, 'text/html');
          //--Resolve promise.--------------------------------------------------
          resolve(response);
        }
      }
    };
    //--Build target string.----------------------------------------------------
    let target = 'templates/' + pageType + '/' + data.layout + '.layout.html';
    //--Perform HTTP request.---------------------------------------------------
    httpRequest.open('GET', target);
    httpRequest.send();
  });
  //==Wait for promise to resolve & return template.============================
  return await template;
}

//==============================================================================
/**
* Function to retrieve app config file.
* @async
*
* @memberof ConsumerApp.Main
*/
async function getConfigFile() {

  if (localStorage.getItem('pccr_config')) {
    return JSON.parse(localStorage.getItem('pccr_config'));
  }else{
    //==build request promise.==================================================
    let config = new Promise(function(resolve, reject) {
      var httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
          if (httpRequest.status === 200) {
            //--Init 'response'.------------------------------------------------
            let response = null;
            //--Handle HTML file.-----------------------------------------------
            let parser = new DOMParser();
            //--Parse into HTML DOM.--------------------------------------------
            response = JSON.parse(httpRequest.responseText);
            //--Resolve promise.------------------------------------------------
            resolve(response);
          }
        }
      };
      //--Build target string.--------------------------------------------------
      let target = 'pccr.config.json';
      //--Perform HTTP request.-------------------------------------------------
      httpRequest.open('GET', target);
      httpRequest.send();
    });
    //==Wait for promise to resolve & return template-==========================
    let conf = await config;
    localStorage.setItem('pccr_config', JSON.stringify(conf));
    return conf;
  }
}

//==============================================================================
/**
* Function to get the labels to display in the appropriate language.        <br>
* Also gets the appropriate icon references.
* @async
*
* @param {string} lang - The language of the app.
*
* @return {Promise} Returns the Promise to resolve.
*
* @memberof ConsumerApp.Main
*/
function getLabels(lang) {
  //==build request promise.====================================================
  return new Promise(function(resolve, reject) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          //--Init 'response'.--------------------------------------------------
          let response = null;
          //--Parse JSON file to Object.----------------------------------------
          response = JSON.parse(httpRequest.responseText);

          //--Store labels & icons to their globals.----------------------------
          labels = response[lang];
          icons = response['icons'];

          let key = lang+'_labels';
          localStorage.setItem(key, JSON.stringify(labels));
          localStorage.setItem('icons', JSON.stringify(icons));
          //--Resolve promise.--------------------------------------------------
          resolve(response);
        }
      }
    };
    //--Build target string.----------------------------------------------------
    let target = 'labels.json';
    //--Perform HTTP request.---------------------------------------------------
    httpRequest.open('GET', target);
    httpRequest.send();
  });
}

//==============================================================================
/**
* Function to retrieve the data for a certain page.
* @async
*
* @param {string} pageType - The page type
* @param {string} pageId - The page ID.
*
* @memberof ConsumerApp.Main
*/
async function getPageData(pageType, pageId) {

  if(localStorage.getItem(pageId) && __CONFIG.offline){
    console.log('data available');
    let data = JSON.parse(localStorage.getItem(pageId));
    //--In case of the first landing page call get the labels for the application.
    if(pageType === 'appmeta'
      && Object.entries(labels).length === 0
      && labels.constructor === Object){
      let key = data.language+'_labels';
      labels = JSON.parse(localStorage.getItem(key));
      icons = JSON.parse(localStorage.getItem('icons'));
    }

    //--Get the page data from localStorage.
    console.log(JSON.parse(localStorage.getItem(pageId)));
    return JSON.parse(localStorage.getItem(pageId));

  }else{
    console.log('data NOT available');
    //--Get the page data from firebase.
    //==Create database reference.==============================================
    let database = firebase.firestore();
    //==Initialize document.====================================================
    let doc = {};
    try {
      //==Get document.=========================================================
      doc = await database
        .collection(appData.user)
        .doc('pages')
        .collection(pageType)
        .doc(pageId)
        .get();
    } catch (e) {
      //==Error case.===========================================================
      console.log('ERROR:', e);
    }
    //==Get data from document.=================================================
    let data = doc.data();
    console.log(data);

    //--Set layout in case of legal page.---------------------------------------
    if(data === undefined && pageType === 'legal'){
      data = {layout : 'basic'};
    }
    //--In case of the first landing page call get the labels for the application-
    if(pageType === 'appmeta'
      && Object.entries(labels).length === 0
      && labels.constructor === Object){
      getLabels(data.language);
    }

    //==Resolve image references.===============================================
    for(let entry in data){
      //==Check allowed types.==================================================
      if(entry === 'image' || entry === 'logo'){
        //--Get firebase download path.-----------------------------------------
        let storageRef = firebase.storage().ref();
        let imageRef = storageRef.child(data[entry].image_path);
        //--Set download URL.---------------------------------------------------
        let url = await imageRef.getDownloadURL();

        data[entry].url = url;

        Offline.getImageFile(
          url,
          pageId,
          data[entry].image_path
        );
      }
    }
    //==Return page data.=======================================================
    localStorage.setItem(pageId, JSON.stringify(data));
    console.log(data);
    return data;
  }
}

//==============================================================================
/**
* Function to convert download URL to data URL.
*
* @see {@link https://stackoverflow.com/questions/48969495/in-javascript-how-do-i-should-i-use-async-await-with-xmlhttprequest|Stackoverflow}
*
* @param {string} url - The download URL
*
* @return {Promise} Returns the Promise to resolve.
*
* @memberof ConsumerApp.Main
* @async
*/
function toDataURL(url) {
  return new Promise(function(resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var reader = new FileReader();
      reader.onloadend = function() {
        resolve(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  });
}

//==============================================================================
/**
* Function to set the back target for in-app navigation.
* @async
*
* @param {string} pageType - The page type
* @param {string} pageId - The page ID.
*
* @memberof ConsumerApp.Main
*/
function setBackTarget(pageType, pageId){
  //==Check for valid input.====================================================
  if(pageId != 'none' && pageType != 'none'){
    //--Initialize nav container.-----------------------------------------------
    let container = undefined;
    //--Differenciate info from other pages.------------------------------------
    if(pageType != 'info'){
      //--Go home.--------------------------------------------------------------
      container = createNavIcon('home');
    }else{
      //--Go back.--------------------------------------------------------------
      container = createNavIcon('left');
    }
    //--Set click listener.-----------------------------------------------------
    container.onclick = function(){
      displayPage(pageType, pageId);
    };

    //--Add to page DOM.--------------------------------------------------------
    addToNavigation(container);
    //==Check lagal page (since not an actual page).============================
  }else if(pageType === 'legal'){
    let container = createNavIcon('home');
    //--Set click listener.-----------------------------------------------------
    container.onclick = function(){
      displayPage('appmeta', appData.appmeta);
    };
    //--Add to page DOM.--------------------------------------------------------
    addToNavigation(container);
  }
}

//==============================================================================
/**
* Function to add element to navbar container.
*
* @param {HTMLElement} container - The container element
*
* @memberof ConsumerApp.Main
*/
function addToNavigation(container){
  document.querySelector('#app__footer').appendChild(container);
}

//==============================================================================
/**
* Function to start a tour in guide mode.
*
* @memberof ConsumerApp.Main
*/
function startTour(){
  //==Teset remembered page.====================================================
  currentPage = 0;
  //==Show first page.==========================================================
  displayPage(appData.pages[currentPage].type, appData.pages[currentPage].id);
}

//==============================================================================
/**
* Function to resume a tour in guide mode.
*
* @memberof ConsumerApp.Main
*/
function resumeTour(){
  //==show remembered page======================================================
  displayPage(appData.pages[currentPage].type, appData.pages[currentPage].id);
}

//==============================================================================
/**
* Function to display requested page in explore mode.
*
* @memberof ConsumerApp.Main
*/
function explorePage(){
  //==Get input value.==========================================================
  let requestedPage = document.querySelector('#inp__explore').value;
  console.log(requestedPage);
  //==Check if page exists.=====================================================
  if(appData.pages[requestedPage]){
    //--Goto page.--------------------------------------------------------------
    displayPage(appData.pages[requestedPage].type, appData.pages[requestedPage].id);
    document.querySelector('#invalid-number').classList.add('hidden');
  }else{
    //--Show warning text.------------------------------------------------------
    document.querySelector('#invalid-number').classList.remove('hidden');
  }
}

//==============================================================================
/**
* Function to create a navigation icon for the app footer.
*
* @param {string} type - The type of the navigation icon.
*
* @return {HTMLElement} The navigation icon element.
*
* @memberof ConsumerApp.Main
*/
function createNavIcon(type){
  //==Create container.=========================================================
  let container = document.createElement('div');
  container.classList.add('nav__icon');
  //==Create icon.==============================================================
  let icon = document.createElement('i');
  //==Set fontawesome classes.==================================================
  icon.classList.add('fa-fw');
  icon.classList.add(icons[type][0], icons[type][1]);
  container.appendChild(icon);
  //==Sreturn icon container.===================================================
  return container;
}

//==============================================================================
/**
* Function to show a question in a quiz.
*
* @param {Object} questData - The data object for the question.
* @param {number} [questNumber=0] - The number associated witht the question.
* @param {number} [rightAnswered=0] - The number of questions correctly answerded.

* @return {HTMLElement} The navigation icon element.
*
* @memberof ConsumerApp.Main
*/
async function showQuestion(questData, questNumber = 0, rightAnswered = 0){
  //==Get current question.=====================================================
  let question = questData[questNumber];
  let quest_image = '';
  if(questData[questNumber].layout === 'image'){

    if(questData[questNumber].image.blob){
      //--Replace firebase URL with BLOB-URL.
      let url = await Offline.getImageFromDb(false , questData[questNumber].image.image_path);
	  if(url === undefined){
	    await Offline.getImageFile(false, false, questData[questNumber].image.image_path);
		url = await Offline.getImageFromDb(false , questData[questNumber].image.image_path);
	  }
	   
      console.log('Call after EXECUTED: ', url);
      questData[questNumber].image.url = url;
    }
  }
  //==Get template.=============================================================
  let questTemplate = await getPageTemplate('question', question);
  questTemplate = questTemplate.querySelector('body').innerHTML;

  //==Randomize answers.==================================================
  let answers = [];
  let put_right = Math.floor(Math.random() * (4));
  let number_wrong = 0;
  for(let i=0;i<4;i++){

    if(i === put_right){
      answers.push(question.right);
    }else{
      number_wrong++;
      answers.push(question['false_'+ number_wrong]);
    }
  }

  //==Get the target DOM element in document.===================================
  let questBox = document.querySelector('#question-box');

  //==Get the template and put data in place.===================================
  questTemplate = eval('`' + questTemplate + '`');
  questBox.innerHTML = questTemplate;


  let image = document.querySelector('#question-box img#full-image');
  if(image){
    image.onclick = e => fullSize(e);
  }

  //==Show the element.=========================================================
  questBox.style.display = 'grid';

  //==Get the answer elements.==================================================
  let answerBoxes = questBox.querySelectorAll('.answer');
  //==Add the click listener.===================================================
  for(let box of answerBoxes){
    console.log(box);
    box.onclick = function(e){
      let isRight = false;
      if(e.target.innerHTML === answers[put_right]){
        isRight = true;
      }

      if(isRight){
        box.classList.add('right');
        rightAnswered++;
      }else{
        box.classList.add('wrong');
      }
      questNumber++;
      //==User feedback for answered question.==================================
      setTimeout(function(){
        console.log(questNumber);
        console.log(questData);
        if (questNumber < Object.size(questData)) {
          console.log('quiz continues');
          showQuestion(questData, questNumber++, rightAnswered);
        }else{
          let questString = JSON.stringify(questData);
          console.log('quiz is over');
          let endTemplate =
          `
          <div class="number-of-questions">
            ${rightAnswered} ${labels.right_answered}
          </div>
          <button class="btn button" onclick='showQuestion(${questString})'> ${labels.repeat} </button>
          `;

          document.querySelector('#question-box .app__body')
            .innerHTML = endTemplate;
        }
      }, 1000);
    };
  }
}

//==============================================================================
/**
* Function to evaluate the data according to the ViewModel to produce the page view.
*
* @param {Object} data - The data object.
* @param {number} page - The page template.
* @param {number} body - The body element of the website.
*
* @memberof ConsumerApp.Main
*/
async function evalData(data, page, body){

  if(data.image){
    //==Check if image blob exists in indexedDB.--------------------------------
    if(data.image.blob){
      //--Replace firebase URL with BLOB-URL.
      let url = await Offline.getImageFromDb(false , data.image.image_path);
	  if(url === undefined){
	    await Offline.getImageFile(false, false, data.image.image_path);
		url = await Offline.getImageFromDb(false , data.image.image_path);
	  }
      
      console.log('Call after EXECUTED: ', url);
      // data.image.url = url;
    }
  }

  if(data.logo){
    //==Check if image blob exists in indexedDB.--------------------------------
    if(data.logo.blob){
      //--Replace firebase URL with BLOB-URL.
      let url = await Offline.getImageFromDb(false , data.logo.image_path);
	  if(url === undefined){
	    await Offline.getImageFile(false, false, data.logo.image_path);
		url = await Offline.getImageFromDb(false , data.logo.image_path);
	  }
      console.log('Call after EXECUTED: ', url);
      // data.logo.url = url;
    }
  }

  //==Resolve array (As in admission).
  if(data.rate){
    let itemTemplate = page.querySelector('#rate').outerHTML;

    let container = document.createElement('div');
    container.innerHTML = '';
    for(let item in data.rate){
      let itemValue = data.rate[item];
      let newItem = eval('`' + itemTemplate + '`');
      console.log(newItem);
      container.innerHTML += newItem;
    }

    page.querySelector('#rate').outerHTML = container.innerHTML;
  }

  if(data.keywords){
    let itemTemplate = page.querySelector('#keyword').outerHTML;

    let container = document.createElement('div');
    container.innerHTML = '';
    for(let item in data.keywords){
      let itemValue = data.keywords[item];
      console.log(itemValue);
      let newItem = eval('`' + itemTemplate + '`');
      console.log(newItem);
      container.innerHTML += newItem;
    }

    page.querySelector('#keyword').outerHTML = container.innerHTML;
  }

  if (
    data.creation_date
    || data.birth_date
    || data.start_date)
  {
    let rawDate = '';
    if (data.creation_date) {
      rawDate = data.creation_date;
    }else if (data.birth_date) {
      rawDate = data.birth_date;
    }else if (data.start_date) {
      rawDate = data.start_date;
    }

    let segments = rawDate.date.split('-');
    if(segments.length > 1){
      if(data.language === 'en'){
        rawDate.date = segments[1]+'/'+segments[2]+'/'+segments[0];
      }else if(data.language === 'de'){
        rawDate.date = segments[2]+'.'+segments[1]+'.'+segments[0];
      }
    }

    let outputDate = rawDate.date;

    let rangeIndicator = document.createElement('div');
    let range = false;
    if (rawDate.range) {
      range = true;
      rangeIndicator.classList.add('range-indicator');
      switch (rawDate.range) {
        case 'first_quarter':
          setIndicator(rangeIndicator, 0, 4);
          break;
        case 'second_quarter':
          setIndicator(rangeIndicator, 1, 4);
          break;
        case 'third_quarter':
          setIndicator(rangeIndicator, 2, 4);
          break;
        case 'fourth_quarter':
          setIndicator(rangeIndicator, 3, 4);
          break;
        case 'first_third':
          setIndicator(rangeIndicator, 0, 3);
          break;
        case 'second_third':
          setIndicator(rangeIndicator, 1, 3);
          break;
        case 'third_third':
          setIndicator(rangeIndicator, 2, 3);
          break;
        case 'first_half':
          setIndicator(rangeIndicator, 0, 2);
          break;
        case 'second_half':
          setIndicator(rangeIndicator, 1, 2);
          break;
        case 'none':
          range = false;
          break;

        default:
          range = false;
      }
    }

    if(rawDate.mod && rawDate.mod === 'date_century'){
      let century = '1';
      if(rawDate.date > 100){
        century = parseInt(rawDate.date.substring(0, 1)) + 1;
      }
      if(rawDate.date > 1000){
        century = parseInt(rawDate.date.substring(0, 2)) + 1;
      }
      outputDate = century + labels['century'];
      console.log(outputDate);
    }

    if(range){
      if (data.creation_date) {
        data.creation_date.date = outputDate;
        page.querySelector('body').querySelector('.creation-date').appendChild(rangeIndicator);
      }else if (data.birth_date) {
        data.birth_date.date = outputDate;
        page.querySelector('body').querySelector('.birth-date').appendChild(rangeIndicator);
      }else if (data.start_date) {
        data.start_date.date = outputDate;
        page.querySelector('body').querySelector('.start-date').appendChild(rangeIndicator);
      }
    }
  }

  if(data.death_date
    || data.end_date)
  {
    if (data.death_date) {
      rawDate = data.death_date;
    }else if (data.end_date) {
      rawDate = data.end_date;
    }

    let segments = rawDate.date.split('-');
    if(segments.length > 1){
      if(data.language === 'en'){
        rawDate.date = segments[1]+'/'+segments[2]+'/'+segments[0];
      }else if(data.language === 'de'){
        rawDate.date = segments[2]+'.'+segments[1]+'.'+segments[0];
      }
    }

    let outputDate = rawDate.date;

    let rangeIndicator = document.createElement('div');
    let range = false;
    if (rawDate.range) {
      range = true;
      rangeIndicator.classList.add('range-indicator');
      switch (rawDate.range) {
        case 'first_quarter':
          setIndicator(rangeIndicator, 0, 4);
          break;
        case 'second_quarter':
          setIndicator(rangeIndicator, 1, 4);
          break;
        case 'third_quarter':
          setIndicator(rangeIndicator, 2, 4);
          break;
        case 'fourth_quarter':
          setIndicator(rangeIndicator, 3, 4);
          break;
        case 'first_third':
          setIndicator(rangeIndicator, 0, 3);
          break;
        case 'second_third':
          setIndicator(rangeIndicator, 1, 3);
          break;
        case 'third_third':
          setIndicator(rangeIndicator, 2, 3);
          break;
        case 'first_half':
          setIndicator(rangeIndicator, 0, 2);
          break;
        case 'second_half':
          setIndicator(rangeIndicator, 1, 2);
          break;
        case 'none':
          range = false;
          break;

        default:
          range = false;
      }
    }

    if (rawDate.mod) {

      if(rawDate.mod === 'date_century'){
        let century = '1';
        if(rawDate.date > 100){
          century = parseInt(rawDate.date.substring(0, 1)) + 1;
        }
        if(rawDate.date > 1000){
          century = parseInt(rawDate.date.substring(0, 2)) + 1;
        }
        outputDate = century + labels['century'];
      }
    }
    if(range){
      if (data.death_date) {
        data.death_date.date = outputDate;
        page.querySelector('body').querySelector('.death-date').appendChild(rangeIndicator);
      }else if (data.end_date) {
        data.end_date.date = outputDate;
        page.querySelector('body').querySelector('.end-date').appendChild(rangeIndicator);
      }
    }
  }

  let pageBody = page.querySelector('body').innerHTML;
  pageBody = eval('`' + pageBody + '`');

  body.innerHTML = pageBody;

  let image = document.querySelector('img#full-image');
  if(image){
    image.onclick = e => fullSize(e);
  }


  //==Resolve map reverence.====================================================
  //TODO: May not work on iOS.
  if(data.location) {
    console.log('map reference');
    let map = new google.maps.Map(body.querySelector('#location'), {
      center: {
        lat: data.location.latitude,
        lng: data.location.longitude
      },
      zoom: 15
    });
    let mark = new google.maps.Marker({
      map: map,
      position: {
        lat: data.location.latitude,
        lng: data.location.longitude
      },
      draggable: false
    });
  }

  //==Resolve rendering of room blocks.=========================================
  if(data.blocks){
    let blocks = document.querySelector('#blocks');
    let areaBox = document.createElement('div');

    for(let row = 0; row < data.size; row ++){
      let areaRow = document.createElement('div');
      areaRow.classList.add('room_row');
      for(let col = 0; col < data.size; col ++){
        let block = document.createElement('div');
        if(data.blocks[(row*data.size) + col]){
          let string = data.blocks[(row*data.size) + col];
          if(string.includes('object') || string.includes('poi')){

            if (string.includes('object')) {
              console.log(string);
              block.innerHTML = string.replace('object', '');
              console.log(block.innerHTML);
              console.log(string);
              console.log(string.replace(block.innerHTML, ''));
              block.classList.add(string.replace(block.innerHTML, ''));
            }

            if (string.includes('poi')) {
              console.log(string);
              block.innerHTML = string.replace('poi', '');
              console.log(block.innerHTML);
              console.log(string);
              console.log(string.replace(block.innerHTML, ''));
              block.classList.add(string.replace(block.innerHTML, ''));
            }
          }else {
            block.classList.add(string);
          }
        }
        block.classList.add('room_block');
        areaRow.appendChild(block);
      }
      areaBox.appendChild(areaRow);
    }
    document.documentElement.style
      .setProperty('--grid-size',
        ((window.innerWidth-20)/data.size) + 'px');

    blocks.innerHTML = areaBox.innerHTML;
  }

  //==Resovle QUIZ interaction.=================================================
  if(data.questions){
    //==display number of questions
    let questionNumber = document.querySelector('.number-of-questions');
    questionNumber.innerHTML =
      labels.number_of_questions + data.questions.length;

    let btn_start = document.querySelector('#quiz__btn_start');
    btn_start.onclick = async function(){
      let questData = {};
      //==Prepare Quiz -> get Questions init: scores, start <-> restart
      for(let i = 0; i < data.questions.length; i++){
        questData[i] = await getPageData('question', data.questions[i]);
      }
      showQuestion(questData);
    };
  }
}

/**
* Enable size function on generic objects.
*
* @param {Object} obj - An Object.
*
* @return {number} The size of the object.
*
* @memberof ConsumerApp.Main
*/
Object.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

/**
* Function to set the date indicator element.
*
* @param {HTMLElement} container - A container element.
* @param {number} count - The counter for the indicator.
* @param {number} total - The length of the indicator.
*
* @memberof ConsumerApp.Main
*/
function setIndicator(container, count, total){
  for(let i=0;i<total;i++){
    let rangeDot = document.createElement('div');
    rangeDot.classList.add('range-dot');
    if (i === count) {
      rangeDot.classList.add('active');
    }
    container.appendChild(rangeDot);
  }
}

function fullSize(e){
  console.log('click', e.target);
  e.target.parentNode.classList.toggle('fullscreen');

  if(document.querySelector('.image-galery')){
    console.log(document.querySelector('.image-galery').scrollTop);
    e.target.parentNode.style.top =
      document.querySelector('.image-galery').scrollTop + 'px';
  }



}
