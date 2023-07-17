//==============================================================================
//==Redirect to Beta-Screen==================================================
//---Avoid unauthorized access to the creator application.
let beta = localStorage.getItem('beta');
if(!beta){
	window.location.replace('/beta-screen');
};
//==============================================================================


//==============================================================================
//==Login Screen Functionality==================================================
//---This script handles the firebase user registration and authentification.

let __CONFIG = {};

(async function() {

  default_language = 'de';
  current_language = default_language;

  //==Language object for the login page. [In script file for performance.]
  let Lang = {};
  Lang.de =
  {
    'header_text' : 'App Framework',
    'login_text' : 'Bitte melden Sie sich an oder registrieren Sie sich!',
    'login_button' : 'Anmelden',
    'signUp_button' : 'Registrieren',
    'email_tooltip' : 'E-Mail',
    'password_tooltip' : 'Passwort',
    'signUp_text' : 'Bitte geben Sie ihre Informationen ein.',
    'name_label' : 'Name',
    'email_label' : 'E-Mail',
    'password_label' : 'Passwort',
    'password_repeat_label' : 'Passwort',
    'organization_label' : 'Organisation',
    'language_label' : 'Sprache',
    'german_langage' : 'Deutsch',
    'english_langage' : 'Englisch',
    'disclaimer_label' : 'Bedingungen akzeptieren',
    'disclaimer_header' : '<b>Bedingungen</b>',
    'disclaimer_text' : 'Alle angegebenen Informationen werden über den Service Firebase von Google gespeichert. <br>'
    +'Der Benutzer ist persönlich dafür verantwortlich, die Nutzungsrechte aller verwendeter Inhalte,'
    +' insbesondere Bilder und andere Multimedia-Dateien, vor der Eingabe zu überprüfen, um keine Rechte Dritter zu verletzen.',
    'register_button' : 'Registrieren',
    'invalid_login' : 'Der Benutzername oder das Passwort ist falsch!',
    'password_mismatch' : 'Die eingegebenen Passwörter stimmen nicht überein!',
    'database_error' : 'Fehlerhafte Eingabe oder keine Datenbankverbindung möglich!'
  };

  Lang.en =
  {
    'header_text' : 'App Framework',
    'login_text' : 'Please log in or create an account!',
    'login_button' : 'Login',
    'signUp_button' : 'Sign Up',
    'email_tooltip' : 'e-mail',
    'password_tooltip' : 'password',
    'signUp_text' : 'Please enter your information.',
    'name_label' : 'Name',
    'email_label' : 'E-Mail',
    'password_label' : 'Password',
    'password_repeat_label' : 'Password',
    'organization_label' : 'Organization',
    'language_label' : 'Language',
    'german_langage' : 'German',
    'english_langage' : 'English',
    'disclaimer_label' : 'accept terms & conditions.',
    'disclaimer_header' : 'Terms & Conditions',
    'disclaimer_text' : 'All information entered is saved using the Service Firebase by Google. <br>'
    +'The user is personally responsible, to check the rights of use of all entered information,'
    +' particularly pictures and other multi-media content, before uploading, to insure not to violate third party rights.',
    'register_button' : 'Register',
    'invalid_login' : 'Your E-Mail or Password is wrong, please try again.',
    'password_mismatch' : 'Password does not match!',
    'database_error' : 'Invalid input or database connection failed!'
  };

  /**
  * Function to set the language for the login page elements.
  * @param {string} lang - The language abbreviation ['de' or 'en'].
  */
  let setLanguage =
    function(lang){
      //==Get the elements.
      let string_elements = document.querySelectorAll('.__String');
      //==Iterate elements.
      for(let i=0; i < string_elements.length; i++){
        //==Get last class of the element [equals the string reference].
        let string_name = string_elements[i]
          .classList.item(string_elements[i].classList.length-1);

        //==Set the appropriate string.
        if(string_elements[i].nodeName === 'INPUT'){
          string_elements[i].placeholder =
            Lang[lang][string_name.substring(2)];
        }else{
          string_elements[i].innerHTML =
            Lang[lang][string_name.substring(2)];
        }
      }
      current_language = lang;
    };

  //==Set default langunage.
  setLanguage(default_language);

  //==Get config file.
  __CONFIG = await getConfigFile();

  //==Firebase configuration.
  let config = __CONFIG.firebase.config;

  //==Initialize firebase connection.
  firebase.initializeApp(config);

  //==Get the relevant DOM elements.
  let loginMail = document.querySelector('#email');
  let loginPassword = document.querySelector('#password');

  let btnLogin = document.querySelector('#login');
  let btnSignUp = document.querySelector('#signup');

  let btnLanguage = document.querySelector('#btn_lang');
  let btnRegister = document.querySelector('#btn_register');
  let btnCloseRegistration = document.querySelector('#btn_close_reg');
  let disclaimerCheckbox = document.querySelector('#disclaimer-checkbox');
  let disclaimerLink = document.querySelector('#disclaimer-link');
  let btnCloseDisclaimer = document.querySelector('#btn_close_disclaimer');

  //==Add 'toggle language' function to the button.
  btnLanguage.addEventListener('click', e => {
    if(e.target.innerHTML === '[en]'){
      setLanguage(e.target.innerHTML.substring(1,3));
      e.target.innerHTML = '[de]';
    }else if(e.target.innerHTML === '[de]'){
      setLanguage(e.target.innerHTML.substring(1,3));
      e.target.innerHTML = '[en]';
    }
  });

  //==Add 'login' function to the button.
  btnLogin.addEventListener('click', e => {
    let email = loginMail.value;
    let pass = loginPassword.value;
    let auth = firebase.auth();
    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(e => {
      console.log(e.message);
      alert(Lang[current_language].invalid_login);
    });
  });

  //==Add 'open registration screen' function to the button.
  btnSignUp.addEventListener('click', e => {
    document.querySelector('#signin-box').classList.add('hidden');
    document.querySelector('#header-box').classList.add('header__registration');
    document.querySelector('#registration-box').classList.remove('hidden');
  });

  //==Add 'close registration screen' function to the button.
  btnCloseRegistration.addEventListener('click', e => {
    document.querySelector('#header-box')
      .classList.remove('header__registration');
    document.querySelector('#signin-box')
      .classList.remove('hidden');
    document.querySelector('#registration-box')
      .classList.add('hidden');
  });

  //==Handle disclaimer box.
  disclaimerCheckbox.addEventListener('click', e => {
    if(e.target.checked === true){
      document.querySelector('#btn_register').disabled = false;
    }else{
      document.querySelector('#btn_register').disabled = true;
    }
  });

  disclaimerLink.addEventListener('click', e => {
    document.querySelector('#disclaimer_text-box').classList.remove('hidden');
  });

  btnCloseDisclaimer.addEventListener('click', e => {
    document.querySelector('#disclaimer_text-box').classList.add('hidden');
  });

  //==Marker, for new user registration.
  let newUser = false;

  //==Add 'registration' function to the button.
  btnRegister.addEventListener('click', e => {
    //==Marker, to save additional properties upon login.
    newUser = true;

    //==Get data fields needing to be checked for registration.
    let mail = document.querySelector('#reg_mail');
    let pass = document.querySelector('#reg_pass');
    let pass_check = document.querySelector('#reg_pass_check');

    //==Check, if password is repeated correctly.
    if(pass.value === pass_check.value){
      firebase.auth().createUserWithEmailAndPassword(mail.value, pass.value)
        .catch(function(error) {
          //==Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          //==Notify user.
          alert(Lang[current_language].database_error);
          //==Reset marker.
          newUser = false;
        });
    }else{
      //==Notify user.
      alert(Lang[current_language].password_mismatch);
      //==Reset password fields.
      pass.value = '';
      pass_check.value = '';
      //==Reset marker.
      newUser = false;
    }
  });

  //==Listen to auth state change.
  firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      console.log(firebaseUser);
      //==Save additional infromation upon registration.
      if(newUser){
        //==WARNING: Resolves changed date format error!
        const firestore = firebase.firestore();
        const settings = {
          timestampsInSnapshots: true
        };

        firestore.settings(settings);

        //==Get additional data fields.
        let name = document.querySelector('#reg_name').value;
        let mail = document.querySelector('#reg_mail').value;
        let orga = document.querySelector('#reg_orga').value;
        let reg_lang = document.querySelector('#reg_lang')
          .options[document.querySelector('#reg_lang').selectedIndex]
          .value;

        //==Open database connection.
        let database = firebase.firestore();

        //==Add user data document to firestore database.
        database
          .collection(firebase.auth().currentUser.uid)
          .doc('user-info')
          .collection('basic-info')
          .add({
            username: name,
            email: mail,
            organization : orga,
            language : reg_lang
          }).then(function(docRef) {
            //==Go to app.
            window.location = 'app-framework/home.html';
          });
      }else{
        //==Go to the app framework landing page.
        window.location = 'app-framework/home.html';
      }
    } else {
      //==Default case on this page!
      console.log('Not logged in!');
      document.querySelector('#signin-box').classList.remove('hidden');
    }
  });
})();

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
    let target = '../pccr.config.json';
    //--perform HTTP request.---------------------------------------------------
    httpRequest.open('GET', target);
    httpRequest.send();
  });
  //==wait for promise to resolve & return template=============================
  return await config;
}

//==============================================================================
//==EOF=========================================================================
