//==============================================================================
/**
 * @file This file contains navigation utility methods.
 *
 * <pre>
 *
*==Method List:================================================================= <br>
* | Name               | Description                                                          |
* ----------------     | ---------------------------------------------------------            |
* | [backTargetHandler]{@link Click.backTargetHandler}  | Function to navigate back to the desired target page.                |
* | [navigateTo]{@link Click.navigateTo}         | Function to navigate to a target screen.                             |
* | [requestFullScreen]{@link Click.requestFullScreen}  | Function to enable Fullscreen mode.                                  |
* | [setBackTarget]{@link Click.setBackTarget}      | Function to set the back target and make 'BACK' button interactable. |
* | [showUserInfo]{@link Click.showUserInfo}       | Function to show and hide the user info pane.                        |
* ----------------     | ---------------------------------------------------------            |
* Window Global:
* | [window.onbeforeunload]{@link Click.window.onbeforeunload}  | Check if reload or native back button click is intentional.      |
* | [webkitfullscreenchange]{@link Click.window.onbeforeunload} | Listen to the window 'fullscreenchange' event.                   |
* </pre>
 * @author       Hebrus
 *
 * @see {@link Click} - The Click namespace.
 */
//==============================================================================

/**
 * The back target.
  */
let __BACK_TARGET = 'none';

/**
 * The Click namespace.
 * @namespace
 */
var Click = {};

(function() {
  //============================================================================
  /**
   * Function to navigate back to the desired target page.
   *
   * @param {string} target - A {@link Glossary.datatype#string|string} describing the target screen state to go back to.
   *
   * @memberof Click
   */
  let backTargetHandler =
    function(target) {
      console.log('click_back:', __BACK_TARGET);
      //==Check type of target
      if(typeof target == 'object'){
        target = __BACK_TARGET;
      }

      switch (target) {
        //----------------------------------------------------------------------
        case 'page_form':
          UI.hideElement('#grid-container');
          UI.hideElement('#form-container');
          UI.hideElement('#formOutput-container');

          UI.resetElementText('#formOutput-container .screen');
          UI.resetElementText('#formOutput');

          //==Recursive back target.
          backTargetHandler('item-info');
          //==Set current back target.
          __BACK_TARGET = 'choose_layout';

          //==If only one layout is available for the chosen page type.
          var vis = document.querySelector('#layout-container');
          var top = window.getComputedStyle(vis).top;
          console.log(top);
          if(top != '0px'){
            //--Recursive back target.
            backTargetHandler(__BACK_TARGET);
          }
          break;
        //----------------------------------------------------------------------
        case 'choose_layout':
          //==Reset tabs to preview area.
          var tabs = document.querySelectorAll('.tab-label');
          tabs[1].click();

          UI.hideElement('#layout-container');
          UI.hideElement('#form-container');

          __BACK_TARGET = 'select-info';
          break;
        //----------------------------------------------------------------------
        case 'landing':
          UI.showElement('#landing-box');

          UI.hideElement('#page-box');
          UI.hideElement('#app-box');
          UI.hideElement('#dash-box');

          __BACK_TARGET = 'none';
          //--Make button non-interactable.
          document.querySelector('#backIcon').classList.add('inactiveBtn');
          break;
        //----------------------------------------------------------------------
        case 'page-box':
          UI.hideElement('#formOutput-container .phone-container');
          UI.hideElement('#interact-box');
          UI.hideElement('#room-box');
          UI.hideElement('#info-page-box');

          UI.showElement('#page-box');

          //--Recursive back target.
          backTargetHandler('select-info');
          //--Set current back target.
          __BACK_TARGET = 'landing';
          break;
        //----------------------------------------------------------------------
        case 'interact-box':
          UI.hideElement('#quiz-editor-box');
          UI.hideElement('#quiz-editor-box #form-container');
          UI.hideElement('#quiz-editor-box #grid-container');

          UI.showElement('#interact-box');

          //==Enable 'CREATE' buttons.
          var buttons =
            document.querySelectorAll(
              '#quiz-editor-box .editor-controls .editor-controls__item'
            )[0].querySelectorAll('button');

          for(button of buttons){
            button.classList.remove('inactiveBtn');
            button.disabled = false;
          }

          __BACK_TARGET = 'page-box';
          break;
        //----------------------------------------------------------------------
        case 'room-box':
          document.querySelector('#__string-btnClearRoom').click();

          UI.hideElement('#area-editor-box');

          UI.showElement('#room-box');

          __BACK_TARGET = 'page-box';
          break;
        //----------------------------------------------------------------------
        case 'select-info':
          UI.hideElement('#instruction-slideIn');
          UI.hideElement('#interaction-slideIn');
          UI.hideElement('#select-choices');

          __BACK_TARGET = 'page-box';
          break;
        //----------------------------------------------------------------------
        case 'item-info':
          UI.hideElement('#item-interaction-controls');
          UI.hideElement('#formOutput-container .footer-buttons');
          UI.hideElement('#formOutput-container');

          //~~Set matching instruction string.
          document.querySelector('#__string-instructionContent').innerHTML =
            langJSON.util.lables.instructionContent;

          __BACK_TARGET = 'select-info';
          break;
        //----------------------------------------------------------------------
        case 'goto-apps':
          UI.hideElement('#app-editor-box');
          UI.hideElement('#app-editor-box #form-container');
          UI.hideElement('#app-editor-box #page-container__list');
          UI.hideElement('#app-editor-box #page-select-popup');
          UI.hideElement('#app-change-box');

          UI.resetElementText('#app-editor-box #form-container');
          UI.resetElementText('#app-editor-box #app-editor-page-preview .screen');
          UI.resetElementText('#app-editor-box #page-container');

          UI.showElement('#app-box');

          //--Reset 'ADD' button visibility.
          document.querySelector('#app-editor-box .btn_add-page-to-app')
            .classList.add('hidden');

          __BACK_TARGET = 'landing';
          break;
        //----------------------------------------------------------------------
        default:
          console.log('target not defined:', __BACK_TARGET);
      }
    };

  //============================================================================
  /**
   * Function to navigate to a target screen.
   * @memberof Click
   * @param {HTMLElement} element -  The id of the {@link Glossary.datatype#HTMLElement|HTMLElement} is describing the desired target screen state.
   */
  let navigateTo = function(element) {
    console.log('navigate_to:', element.id);
    switch (element.id) {
      //------------------------------------------------------------------------
      case 'goto-page':
        UI.hideElement('#landing-box');

        UI.showElement('#page-box');

        setBackTarget('landing');
        break;
      //------------------------------------------------------------------------
      case 'page-info':
        UI.hideElement('#page-box');

        UI.showElement('#formOutput-container .phone-container');
        UI.showElement('#info-page-box');

        setBackTarget('page-box');
        break;
      //------------------------------------------------------------------------
      case 'page-room':
        UI.hideElement('#page-box');

        UI.showElement('#room-box');

        setBackTarget('page-box');
        break;
      //------------------------------------------------------------------------
      case 'page-interact':
        UI.hideElement('#page-box');

        UI.showElement('#interact-box');

        setBackTarget('page-box');
        break;
      //------------------------------------------------------------------------
      case 'page-quiz':
        UI.hideElement('#interact-box');

        UI.showElement('#quiz-editor-box');

        setBackTarget('interact-box');
        break;
      //------------------------------------------------------------------------
      case 'page-indoor':
        UI.hideElement('#room-box');

        UI.showElement('#area-editor-box');

        //~~Set type attribute.
        document.querySelector('#area-editor-box #room_type')
          .setAttribute('type', 'indoor');

        setBackTarget('room-box');
        break;
      //------------------------------------------------------------------------
      case 'page-outdoor':
        UI.hideElement('#room-box');

        UI.showElement('#area-editor-box');

        //~~Set type attribute.
        document.querySelector('#area-editor-box #room_type')
          .setAttribute('type', 'outdoor');

        setBackTarget('room-box');
        break;
      //------------------------------------------------------------------------
      case 'add-basic-info':
        Cards.createPageCards('basic');

        UI.showElement('#instruction-slideIn');
        UI.showElement('#interaction-slideIn');
        UI.showElement('#select-choices');

        setBackTarget('select-info');
        break;
      //------------------------------------------------------------------------
      case 'add-advanced-info':
        Cards.createPageCards('advanced');

        UI.showElement('#instruction-slideIn');
        UI.showElement('#interaction-slideIn');
        UI.showElement('#select-choices');

        setBackTarget('select-info');
        break;
      //------------------------------------------------------------------------
      case 'create-info-form':
        UI.showElement('#form-container');
        UI.showElement('#formOutput-container');

        setBackTarget('page_form');
        break;
      //------------------------------------------------------------------------
      case 'form-grid':
        UI.showElement('#formOutput-container');
        UI.showElement('#grid-container');

        setBackTarget('page_form');
        break;
      //------------------------------------------------------------------------
      case 'page-interaction':
        UI.showElement('#item-interaction-controls');

        setBackTarget('item-info');
        break;
      //------------------------------------------------------------------------
      case 'goto-apps':
        UI.hideElement('#landing-box');

        UI.showElement('#app-box');

        setBackTarget('landing');
        break;
      //------------------------------------------------------------------------
      case 'page-new-app':
        UI.hideElement('#app-box');

        UI.showElement('#app-editor-box');

        UI.resetElementText('#app-editor-box #preview-phone');

        //--Reset items in control bar.
        var controls =
          document.querySelectorAll('#app-editor-box .editor-controls__item');
        //--Disable the 'SAVE META' button.
        var controlButton = controls[0].querySelectorAll('button');
        controlButton[0].disabled = false;

        //--Disable the 'SAVE LANDING' button.
        controlButton = controls[1].querySelectorAll('button');
        controlButton[0].disabled = true;

        //--Disable the 'ADD PAGE' buttons.
        controlButton = controls[2].querySelectorAll('button');
        for (let button of controlButton) {
          button.disabled = true;
        }

        setBackTarget('goto-apps');
        break;
      //------------------------------------------------------------------------
      case 'page-change-app':
        UI.hideElement('#app-box');

        UI.showElement('#app-change-box');

        //--Show app list for change.
        Dash.showAppList(
          document.querySelector('#app-change-box  .app-list'),
          true);

        setBackTarget('goto-apps');
        break;
      //------------------------------------------------------------------------
      case 'goto-dash':
        UI.hideElement('#landing-box');

        UI.showElement('#dash-box');

        //--Show default app list.
        Dash.showAppList();

        setBackTarget('landing');
        break;
      //------------------------------------------------------------------------
      case '':
        break;
      //------------------------------------------------------------------------
      default:
        console.log('target not defined:', element);
    }
  };

  //============================================================================
  /**
   * Function to enable Fullscreen mode.
   *
   * @see
   * {@link https://stackoverflow.com/questions/16755129/detect-fullscreen-mode|stackoverflow}
    - Stackoverflow thread.
   * @see
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API|Mozilla Dev}
    - Mozilla Developer on Fullscreen API.
   *
   * @memberof Click
   */
  let requestFullScreen =
    function() {
      if (document.webkitFullscreenElement !== null) {
        document.webkitExitFullscreen();
      } else if (
        document.fullscreenEnabled ||
        document.webkitFullscreenEnabled ||
        document.mozFullScreenEnabled ||
        document.msFullscreenEnabled) {
        document.documentElement.webkitRequestFullscreen();
      }
    };

  //============================================================================
  /**
   * Set the back target and make 'BACK' button interactable.
   *
   * @param {string} target - The target screen state to go back to.
   *
   * @memberof Click
   */
  let setBackTarget = function(target) {
    __BACK_TARGET = target;
    document.querySelector('#backIcon').classList.remove('inactiveBtn');
  };

  //============================================================================
  /**
   * Function to show and hide the user info pane.
   * @memberof Click
   */
  let showUserInfo =
  async function() {
    let user_popup = document.querySelector('#userInfo');
    console.log(__USER);
    user_popup.querySelector('#user_name').innerHTML = __USER.username;
    user_popup.querySelector('#user_email').innerHTML = __USER.email;
    user_popup.querySelector('#user_orga').innerHTML = __USER.organization;

    document.querySelector('#userInfo').classList.toggle('hidden');
  };

  //============================================================================

  //==Make public functions available on the namespace Object.
  this.backTargetHandler = backTargetHandler;
  this.navigateTo = navigateTo;
  this.requestFullScreen = requestFullScreen;
  this.setBackTarget = setBackTarget;
  this.showUserInfo = showUserInfo;
  //============================================================================
}).apply(Click);

//==============================================================================
//==============================================================================
//==Document & Window Level Events==============================================
//==============================================================================
//==============================================================================
/**
  * Listen to the window 'fullscreenchange' event.
  *
  * @see
  * {@link https://developer.mozilla.org/en-US/docs/Web/Events/fullscreenchange|Mozilla Dev}
  - Mozilla Developer on fullscreenchange.
  *
  * @memberof Click
  */
document.addEventListener('webkitfullscreenchange', function(event) {
  document.querySelector('#fullScreenIcon').classList.toggle('fa-expand');
  document.querySelector('#fullScreenIcon').classList.toggle('fa-compress');
});

//==============================================================================
/**
 * Check if reload or native back button click is intentional.
 *
 * @return {string} Mandatory to prompt default message to user.
 *
 * @see
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload|Mozilla Dev}
 - Mozilla Developer on onbeforeunload.
 *
 * @memberof Click
 */
window.onbeforeunload = function() {
  return 'Ask if saved state!';
};
//==============================================================================
//==EOF=========================================================================
