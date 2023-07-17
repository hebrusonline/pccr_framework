//==============================================================================
//==Login Functionality=========================================================
//---This script checks the firebase login state, before pageload.
//---Redirects to Login/Registration screen if not signed in.

//==The cofiguration information.
__CONFIG = {};

(function() {
  //==Get config file.
  Data.getFile('../', 'pccr.config', 'json').then(
    (value) => {
      __CONFIG = value;

      //==Initialize Firebase config.
      const config = __CONFIG.firebase.config;

      firebase.initializeApp(config);

      //==Listen for any auth state change (called onload)
      //===to check if active user is logged in.
      firebase.auth().onAuthStateChanged(firebaseUser => {
        //==If user IS logged in, firebaseUser object is returned,
        //===wait for pageload.
        if (firebaseUser) {
          // Nothing to do... REMINDER: this is a lie! Firefox will preload onload() without firebase setup!
		  loadPage();
        } else {
          //==If user is NOT logged in, return to login page.
          console.log('Not logged in!');
          window.location = '../index.html';
        }
      });

      //==RESOLVED WARNING: 'changed date format' - API error!
      const firestore = firebase.firestore();

      const settings = {
        timestampsInSnapshots: true
      };
      firestore.settings(settings);
    }
  );
}());
//==============================================================================
//==EOF=========================================================================
