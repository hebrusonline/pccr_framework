//==============================================================================
/**
* @file
* This file defines functions necessary for the consumer application's landing list. <br>
* The data for each registered app needs to be retrieved to be displayed in the list.
* <pre>
*
*==Method List:================================================================= <br>
* | Name                     | Description                                                                   |
* -------------------------- | ---------------------------------------------------------                     |
* | [getAppData]{@link ConsumerApp.List.getAppData}               | Function to get app data of all registered app from the appfolder.            |
* | [getItemDataAsync]{@link ConsumerApp.List.getItemDataAsync}         | Function to get necessary app data for a list item.                           |
* | [getAppList]{@link ConsumerApp.List.getAppList}               | Function to get app meta data for each app & add list item to UI.             |
* | [getConfigFile]{@link ConsumerApp.List.getConfigFile}            | Function to get the config file containing the API information.               |
* </pre>
* @author       Hebrus
*
* @see {@link ConsumerApp.List} - The ConsumerApp namespace.
*/
//==============================================================================
/**
 * The ConsumerApp.List namespace.
 * @namespace ConsumerApp.List
 */
//==============================================================================
let __CONFIG = {};

window.customElements.define('dash-item', DashItem);

//==============================================================================
/**
* Onload
*/
(async function() {
  console.log('Load...');
  //==Get the config file.
  __CONFIG = await getConfigFile();

  //==Initialize Firebase config.
  const config = __CONFIG.firebase.config;

  firebase.initializeApp(config);

  //==RESOLVED WARNING: 'changed date format' - API error!
  const firestore = firebase.firestore();

  const settings = {
    timestampsInSnapshots: true
  };
  firestore.settings(settings);

  //==Get app meta files.
  getAppList();

  document.querySelector('#btn__menu').onclick = function() {
    document.querySelector('#btn__menu').classList.add('hidden');
    document.querySelector('#app__slidein_menu').classList.remove('hidden');
    document.querySelector('#app__content').style.filter = 'blur(4px)';
  };

  document.querySelector('#btn__language').onclick = function() {
    let lang = document.querySelector('#btn__language').getAttribute('lang');

    if (lang === 'de') {
      //==Switch to english.
      document.querySelector('#btn__language').setAttribute('lang', 'en');
      document.querySelector('#btn__close_menu').innerHTML = 'Close menu';
      document.querySelector('#btn__language img').setAttribute('src', 'assets/de.png');
      document.querySelector('.description__content.de').classList.add('hidden');
      document.querySelector('.description__content.en').classList.remove('hidden');

    } else if (lang === 'en') {
      //==Switch to german.
      document.querySelector('#btn__language').setAttribute('lang', 'de');
      document.querySelector('#btn__close_menu').innerHTML = 'Menü verlassen';
      document.querySelector('#btn__language img').setAttribute('src', 'assets/en.png');
      document.querySelector('.description__content.en').classList.add('hidden');
      document.querySelector('.description__content.de').classList.remove('hidden');

    }
    document.querySelector('#app__slidein_menu').classList.remove('hidden');
    document.querySelector('#app__content').style.filter = 'blur(4px)';
  };

  document.querySelector('#btn__close_menu').onclick = function() {
    document.querySelector('#btn__menu').classList.remove('hidden');
    document.querySelector('#app__slidein_menu').classList.add('hidden');
    document.querySelector('#app__content').style.filter = 'blur(0)';
  };

  document.querySelector('#btn__imprint').onclick = function() {
    console.log('Imprint');
    document.querySelector('#imprint_box').classList.toggle('hidden');
    document.querySelector('#btn__imprint').classList.toggle('active');
  };
}());

//==============================================================================
/**
 * Function to get app data of all registered app from the appfolder.
 * @async
 *
 * @memberof ConsumerApp.List
 */
async function getAppData() {
  //==Create firestore reference.
  let database = firebase.firestore();

  //--Get data document from firestore.
  try {
    let result = await database
      .collection(__CONFIG.appfolder)
      .get();

    return result;

  } catch (error) {
    console.log('Error getting documents: ', error);
  }
}

//==============================================================================
/**
 * Function to get necessary app data for a list item.
 *
 * @param {string} pageID - The page ID string.
 * @param {string} type - The page type.
 * @param {string} user - The page type.
 *
 * @memberof ConsumerApp.List
 */
async function getItemDataAsync(pageID, type, user) {
  var database = firebase.firestore();
  let result = {};
  try {
    result = await database
      .collection(user)
      .doc('pages')
      .collection(type)
      .doc(pageID)
      .get();
  } catch (e) {
    console.log(e);
  }
  return result;
}

//==============================================================================
/**
 * Function to get app meta data for each app & add list item to UI.
 *
 * @memberof ConsumerApp.List
 */
async function getAppList() {
  let appList = document.querySelector('#app-list');
  appList.innerHTML = '';

  let appData = await getAppData();
  console.log(appData);

  try {
    appData.forEach(async function(doc) {
      let data = doc.data();
      data.id = doc.id;
      console.log(data);
      let appmeta = await getItemDataAsync(data['appmeta'], 'appmeta', data['user']);
      console.log(appmeta.data());

      let listItem = document.createElement('dash-item');
      listItem.initElement(appmeta.data(), data);

      appList.appendChild(listItem);
    });
  } catch (e) {
    console.log(e);
  }
}

//==============================================================================
/**
 * Function to get the config file containing the API information.
 *
 * @memberof ConsumerApp.List
 */
async function getConfigFile() {
  //==build request promise.====================================================
  let config = new Promise(function(resolve, reject) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          //--init 'response' --------------------------------------------------
          let response = null;
          //--handle HTML file--------------------------------------------------
          let parser = new DOMParser();
          //--parse into HTML DOM-----------------------------------------------
          response = JSON.parse(httpRequest.responseText);
          //--resolve promise---------------------------------------------------
          resolve(response);
        }
      }
    };
    //--build target string.----------------------------------------------------
    let target = 'pccr.config.json';
    //--perform HTTP request.---------------------------------------------------
    httpRequest.open('GET', target);
    httpRequest.send();
  });
  //==Wait for promise to resolve & return template.============================
  return await config;
}
