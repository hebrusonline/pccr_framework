//==============================================================================
//==This script initializes the page onload.
//---Language initialization of the user interface elements.
//---Initialization of navigation trageting of certain navigation elements.

//==GLOBALS
let FA;
let __USER;


let loadPage = function (){
  Lang.__LANG = 'en';

  //==Get fontawesome assignments.
  Data.getFile('util/data/', 'fontawesome', 'json').then(
    (value) => {
      FA = value;
    }
  );
  //============================================================================
  //==Check login state.
  firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      //==Get 'basic-info' document of current user from the database.
      let database = firebase.firestore();
      try {
        database
          .collection(firebase.auth().currentUser.uid)
          .doc('user-info')
          .collection('basic-info')
          .get().then(function(result) {
            //==Set user information.
            console.log('User Info: ', result.docs[0].data());
            __USER = result.docs[0].data();
            //---Add user firebase id.
            __USER.id = firebaseUser.uid;
            //==Set user language.
            Lang.__LANG = __USER.language;
            //==DEBUG
            // Lang.__LANG = 'test';
            console.log('Language:', Lang.__LANG);

            //==Initialize the language references.=============================
            (async function() {
              await Lang.getJSON('forms');
              await Lang.getJSON('cards');
              await Lang.getJSON('util');
            })().then(function() {
              //==Set text to their labels for the user's language.
              Lang.setLables();
              //==Remove loading screen one second after rendering has finished.
              let cover = document.querySelector('#login-cover');
              setTimeout(function() {
                cover.classList.add('hidden');
              }, 1000);
            });
          });
      } catch (err) {
        console.log('Error getting documents: ', err);
      }
      //========================================================================
      //==Add click listeners for static interaction elements.
      //---Full Screen
      document.querySelector('#btnToogleFullscreen').onclick =
        Click.requestFullScreen;
      //---User Info
      document.querySelector('#btnUserInfo').onclick =
        Click.showUserInfo;
      //---Logout
      let btnLogout = document.querySelector('#btnLogout');
      btnLogout.addEventListener('click', e => {
        firebase.auth().signOut();
      });
      //========================================================================
      //==Initialize navigation elements.=======================================
      //---Get navigation targets.
      let nav_targets = document.querySelectorAll('.__nav_target');
      //---Add event listener to navigation targets.
      for (let div of nav_targets) {
        div.onclick = function() {
          Click.navigateTo(this);
        };
      }
      //---Add functionality to "BACK" button
      document.querySelector('#btnBack').onclick =
        Click.backTargetHandler;

      //---Tab Accessability
      document.querySelector('body').onclick =
        function(e) {

          try {
            if (document.activeElement.classList.contains('btn')) {
              document.activeElement.blur();
            }
          } catch (e) {
            console.log('Not relevant!');
          }

        };

      document.querySelector('body').onkeydown =
        function(e) {
          var TABKEY = 'Tab';
          if (e.key == TABKEY) {
            try {
              if (document.querySelector(':focus').id === 'btnLogout') {

                let focusArea = document.querySelector('#form-container');
                if (focusArea.classList.contains('show')) {
                  let input = focusArea.querySelector('input');

                  //==Focus must wait for empty queue, so it is necessary to create new message.
                  //==src: https://stackoverflow.com/questions/33955650/what-is-settimeout-doing-when-set-to-0-milliseconds/33955673
                  //==call this on every navigation instead!
                  window.setTimeout(function() {
                    input.focus();
                  }, 0);
                }
              }
            } catch (e) {
              console.log('Not relevant!');
            }
          }
        };

      //==Add credentials for maps API
      let mapsScript = document.createElement('script');
      //==TODO: credentials!
      mapsScript.setAttribute('src', __CONFIG.maps.src);
      document.querySelector('body').appendChild(mapsScript);
      //========================================================================
      //==If no user is logged in return to login page.=========================
    } else {
      console.log('Not logged in!');
      setTimeout(function() {
        window.location = '../index.html';
      }, 1000);
    }
  });
};

//==============================================================================
//==EOF=========================================================================
