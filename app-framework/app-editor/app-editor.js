//==============================================================================
/**
 * @file This File contains definitions concerned with the AppEditor namespace.
 * <pre>
 *
 *==Method List:================================================================= <br>
 * | Name                     | Description                                                                |
 * -------------------------- | ---------------------------------------------------------                  |
 * | [addCubeToApp]{@link AppEditor.addCubeToApp}             | Function to add a CUBE page to the app page list.                          |
 * | [addPageToApp]{@link AppEditor.addPageToApp}             | Function to add a page to the App.                                         |
 * | [changeApp]{@link AppEditor.changeApp}                | Function to prepare the AppEditor to change an existing app.               |
 * | [commitApp]{@link AppEditor.commitApp}                | Function to save the assambled app to the database.                        |
 * | [commitCubePage]{@link AppEditor.commitCubePage}           | Function to save an assambled CUBE page to the database.                   |
 * | [commitLandingPage]{@link AppEditor.commitLandingPage}        | Function to save the assambled landing page to the database.               |
 * | [createCubePage]{@link AppEditor.createCubePage}           | Function to prepare the editor to create a cube page.                      |
 * | [createEditorGrid]{@link AppEditor.createEditorGrid}         | Function to create the selection grid for the chosen page type.            |
 * | [createUpload]{@link AppEditor.createUpload}             | Function to create the file upload for the CUBE media.                     |
 * | [showAppEditorSelectorPane]{@link AppEditor.showAppEditorSelectorPane}| Function to show the editor selection pane for the desired page type.      |
 * | [showLandingPageEditor]{@link AppEditor.showLandingPageEditor}    | Function to add the landing page to the app.                               |
 * | [showMetaDataEditor]{@link AppEditor.showMetaDataEditor}       | Function to add the landing page to the app.                               |
 * | [showMetaDataEditor]{@link AppEditor.showMetaDataEditor}       | Function to initialize the metadata form for the App Editor.               |
 * | [showPageSelection]{@link AppEditor.showPageSelection}        | Function to show the appropriate selection screen for an advanced page.    |
 * </pre>
 * @author       Hebrus
 *
 * @see {@link AppEditor} - The AppEditor namespace.
 */
//==============================================================================

//==Register used custom elements EditorPage and PageItem.
window.customElements.define('editor-page', EditorPage);
window.customElements.define('page-item', PageItem);

/**
 * The AppEditor namespace.
 * @namespace
 */
let AppEditor = {};

//==Static AppEditor members.
/**
 * The current app's content type.
 * @type {string}
 */
AppEditor.content = 'none';
/**
 * The current app's landing page IDs (basic info & appmeta).
 * @type {string}
 */
AppEditor.landing = 'none';
/**
 * The current app's language.
 * @type {string}
 */
AppEditor.language = 'none';

//==Namespacing construct.
(function() {
  //============================================================================
  /**
   * Function to add a CUBE page to the app page list.                      <br>
   *                                                                        <br>
   *  @see {@link AppEditor.addPageToApp} - But for the cube page.
   *
   * @param {string} cubeID - The ID of the CUBE data document.
   *
   * @memberof AppEditor
   */
  let addCubeToApp =
    function(cubeID) {
      //==Get the rendered page to be the base page for the CUBE.
      let basePage = document
        .querySelector('#app-editor-box #page-container #cubescreen .screen')
        .cloneNode(true);
      //==Get the app page list.
      let pageList = document.querySelector('#app-editor-box #page-list');
      //==Create new page list item.
      let newListItem = document.createElement('page-item');
      //==Get the type of the base page.
      let basePageType = basePage.getAttribute('type');
      //==Clone the base page but set the type & ID of the CUBE.
      let newBase = basePage.cloneNode(true);
      newBase.page_id = cubeID;
      newBase.setAttribute('type', 'cube');

      //==Initialize the list item with the base page.
      newListItem.initElement(newBase, basePageType);

      //==Fix scrolling issues for margin-top on listscreen element.
      pageList.onscroll = function() {
        //--Get current margin value.
        let margin = window
          .getComputedStyle(document.documentElement)
          .getPropertyValue('--listscreen-margin');
        //--Get current scroll distance.
        let scroll = document
          .querySelector('#app-editor-box #page-list')
          .scrollTop;
        //--Add scroll distance to margin (shift up --> negative value).
        let newMargin = parseInt(margin) - scroll;
        //--Set new margin for the listscreen.
        document
          .body.style.setProperty('--listscreen-margin', newMargin + 'px');
      };
      newListItem.setAttribute('order-id', pageList.children.length);
      //--Add the app page list item to the app page list.
      pageList.appendChild(newListItem);
      //--Update list for new item to aneable drag.
      Drag.updateAppPageList();

      //==Reset editor container.
      document.querySelector('#app-editor-box #page-container').innerHTML = '';
    };

  //============================================================================
  /**
   * Function to add a page to the App.                                     <br>
   *                                                                        <br>
   * In case of the 'basic page types': add page to the landing page editor.<br>
   * In case of CUBE 'base' page: show base page preview.                   <br>
   * In case of a CUBE page ('related', 'media', 'interact'):
   *  add page to the appropriate cube preview section.                     <br>
   * In case of the advanced page types: add page to the app page list.     <br>
   *
   * @param {HTMLElement} [element=The page preview section of the App Editor.]
   *  - A element containing a page preview screen.
   *
   * @memberof AppEditor
   */
  let addPageToApp =
    function(element = document.querySelector('#app-editor-page-preview')) {
      //==Get the preview sceen element.
      let phone = element.querySelector('.screen');

      //==Check for basic page types.
      if (['info', 'hours', 'admission'].includes(phone.getAttribute('type'))) {

        //--Get the target container element for the page type.
        let parentElement = document
          .querySelector(
            '#app-editor-box editor-page.' + phone.getAttribute('type')
          );

        //--Put the preview inside the container.
        parentElement.querySelector('.small-screen').innerHTML =
          phone.innerHTML;

        //--Set the screens attributes.
        parentElement.querySelector('.small-screen').page_id = phone.page_id;
        parentElement
          .querySelector('.small-screen').type = phone.getAttribute('type');
        parentElement
          .querySelector('.small-screen')
          .setAttribute('type', phone.getAttribute('type'));

        //--Hide page selection pane and its inner elements.
        let area = document.querySelector('#app-editor-box #page-select-popup');
        area.classList.add('hidden');
        area.querySelector('.select-popup-pages').classList.add('hidden');
        area.querySelector('.select-popup-grid').classList.add('hidden');
        //--Reset 'ADD' button visibility.
        document
          .querySelector('#app-editor-box .btn_add-page-to-app')
          .classList.add('hidden');
        //--Reset preview phone.
        phone.innerHTML = '';
      } else {
        //==Check for CUBE 'base' page.
        if (document.querySelector('#app-editor-box #page-select-popup')
          .getAttribute('targetID') === 'cube') {

          //--Get CUBE page preview screen element.
          let cubescreen = document
            .querySelector('#page-container #cubescreen .screen');
          //--Put the preview inside the container.
          cubescreen.outerHTML = phone.outerHTML;
          //--Get new screen element.
          cubescreen = document
            .querySelector('#page-container #cubescreen .screen');
          //-Set the new screens attributes.
          cubescreen.classList.add('small-screen');
          cubescreen.page_id = phone.page_id;

          //--Hide selection pane and its inner elements.
          let area = document
            .querySelector('#app-editor-box #page-select-popup');
          area.classList.add('hidden');
          area.querySelector('.select-popup-pages').classList.add('hidden');
          area.querySelector('.select-popup-grid').classList.add('hidden');
          //--Reset 'ADD' button visibility.
          document
            .querySelector('#app-editor-box .btn_add-page-to-app')
            .classList.add('hidden');
          //--Reset preview phone.
          phone.innerHTML = '';
        } else
        //==Check for CUBE 'related' page.
        if (document.querySelector('#app-editor-box #page-select-popup')
          .getAttribute('targetID') === 'cubesingle') {

          //--Clone page content.
          let newPage = phone.cloneNode(true);
          //--Update attributes.
          newPage.page_id = phone.page_id;
          newPage.classList.add('small-screen');

          //--Add button to allow removal of the page.
          let deleteButton = document.createElement('button');
          deleteButton.classList.add('btn', 'button');
          deleteButton.innerHTML = 'x';
          //-Add click listener for removal capabilities.
          deleteButton.onclick = function(e) {
            //Reomve calling page element.
            e.target.parentNode.parentNode.parentNode
              .removeChild(e.target.parentNode.parentNode);
          };
          //-Add removal button to page footer.
          newPage.querySelector('.preview-phone__footer')
            .appendChild(deleteButton);
          //--Add page to preview section.
          document
            .querySelector('#app-editor-box #preview__bottom #preview_content')
            .appendChild(newPage);

          //==Maitain container width after element was added to enable scroll.
          document
            .querySelector('#app-editor-box #preview__bottom #preview_content')
            .style.setProperty(
              'width',
              getComputedStyle(document
                .querySelector('#app-editor-box .cube_content_preview')).width
            );

          //INFO: Keep selection pane open to being able selecting anoter page.

          //--Reset 'ADD' button visibility.
          document
            .querySelector('#app-editor-box .btn_add-page-to-app')
            .classList.add('hidden');
          //--Reset preview phone.
          phone.innerHTML = '';
        } else
        //==Check for CUBE 'media' page.
        if (document.querySelector('#app-editor-box #page-select-popup')
          .getAttribute('targetID') === 'media') {
          //--Upload the base image.
          let storageRef = firebase.storage().ref();
          let storageID = new Date().getTime();
          try {
            let newImage = document
              .querySelector('#app-editor-box .cube_image_output img');

            let imageRef = storageRef
              .child('images/' + storageID + '.' + 'cube');

            //-Resolve file upload.
            let file = newImage.file;
            imageRef.put(file).then(function(snapshot) {

              //-Get image output container.
              let output = document
                .querySelector(
                  '#app-editor-box #preview-phone .cube_image_output img'
                );

              //-Get image preview container.
              let preview = document
                .querySelector(
                  '#app-editor-box #preview__behind .preview_pane__body'
                );

              //-Cerate preview box.
              let imageBox = document.createElement('div');
              imageBox.classList.add('cubeImgPreview');
              //-Add image to preview.
              let newImage = document.createElement('img');
              newImage.classList.add('preview-image');
              newImage.src = output.src;
              imageBox.appendChild(newImage);

              //-Add button to allow removal of the image.
              let deleteButton = document.createElement('button');
              deleteButton.classList.add('btn', 'button');
              deleteButton.innerHTML = 'x';
              deleteButton.onclick = function(e) {
                e.target.parentNode.parentNode
                  .removeChild(e.target.parentNode);
                //-Remove entry from the storage information array.
                let mediaArray = [];
                if (preview.mediaJSON) {
                  //Get the storage information array.
                  mediaArray = JSON.parse(preview.mediaJSON);
                }
                //Loop the array entries.
                for (var i = mediaArray.length - 1; i >= 0; i--) {
                  //Find the entry to remove.
                  if (mediaArray[i].ref === 'images/' + storageID + '.' + 'cube') {
                    //Remove the entry.
                    mediaArray.splice(i, 1);
                  }
                }
                //Add the updated storage information array.
                preview.mediaJSON = JSON.stringify(mediaArray);
              };
              //-Add the 'DELETE' button.
              imageBox.appendChild(deleteButton);
              //-Add the preview box to the container.
              preview.appendChild(imageBox);

              //-Update storage infromation.
              let mediaArray = [];
              if (preview.mediaJSON) {
                //Get the storage information array.
                mediaArray = JSON.parse(preview.mediaJSON);
              }
              //Add the entry.
              mediaArray.push({
                type: 'image',
                ref: 'images/' + storageID + '.' + 'cube'
              });
              preview.mediaJSON = JSON.stringify(mediaArray);

              //--Reset 'ADD' button visibility.
              document
                .querySelector('#app-editor-box .btn_add-page-to-app')
                .classList.add('hidden');
            });
          } catch (e) {
            console.log('Upload Error:', e);
          }
        } else
        //==Check for CUBE 'interact' page.
        if (document.querySelector('#app-editor-box #page-select-popup')
          .getAttribute('targetID') === 'interact') {

          //--Clone page content.
          let newPage = phone.cloneNode(true);
          //--Update attributes.
          newPage.classList.add('small-screen');
          newPage.page_id = phone.page_id;

          //--Add button to allow removal of the page.
          let deleteButton = document.createElement('button');
          deleteButton.classList.add('btn', 'button');
          deleteButton.innerHTML = 'x';
          deleteButton.onclick = function(e) {
            //Remove calling element.
            e.target.parentNode.parentNode.parentNode
              .removeChild(e.target.parentNode.parentNode);
          };
          newPage.querySelector('.preview-phone__footer')
            .appendChild(deleteButton);

          //--Reset preview container and add the previw page (only one allowed)
          let container = document
            .querySelector('#app-editor-box #preview__top #preview_content');
          container.innerHTML = '';
          container.appendChild(newPage);

          //--Hide selection pane and inner elements.
          let area = document
            .querySelector('#app-editor-box #page-select-popup');
          area.classList.add('hidden');
          area.querySelector('.select-popup-pages').classList.add('hidden');
          area.querySelector('.select-popup-grid').classList.add('hidden');
          //-Hide the cubeinteract pane.
          area.querySelector('.select-popup-pages.__cubeinteract')
            .classList.add('hidden');

          //--Reset 'ADD' button visibility.
          document
            .querySelector('#app-editor-box .btn_add-page-to-app')
            .classList.add('hidden');
          //--Reset preview phone.
          phone.innerHTML = '';

          //==Add single page to app page list.
        } else {
          //--Get the app page list.
          let pageList = document.querySelector('#app-editor-box #page-list');
          //--Create new page list item.
          let newListItem = document.createElement('page-item');
          newListItem.initElement(phone);

          //--Reset 'ADD' button visibility.
          document
            .querySelector('#app-editor-box .btn_add-page-to-app')
            .classList.add('hidden');

          //==Fix scrolling issues for margin-top on listscreen element.
          pageList.onscroll = function() {
            //--Get current margin value.
            let margin = window
              .getComputedStyle(document.documentElement)
              .getPropertyValue('--listscreen-margin');
            //--Get current scroll distance.
            let scroll = document
              .querySelector('#app-editor-box #page-list')
              .scrollTop;
            //--Add scroll distance to margin (shift up --> negative value).
            let newMargin = parseInt(margin) - scroll;
            //--Set new margin for the listscreen.
            document
              .body.style.setProperty('--listscreen-margin', newMargin + 'px');
          };
          newListItem.setAttribute('order-id', pageList.children.length);
          //--Add the app page list item to the app page list.
          pageList.appendChild(newListItem);
          //--Update list for new item to aneable drag.
          Drag.updateAppPageList();
        }
      }
    };

  //============================================================================
  /**
   * Function to prepare the AppEditor to change an existing app.           <br>
   *
   * @param {Object} appData - The data object of the app to be changed.
   * @param {string} contentType - The app's content type (guide || explore).
   *
   * @memberof AppEditor
   */
  let changeApp =
    async function(appData, contentType) {
      //==Update the back target.
      Click.backTargetHandler('goto-apps');
      //==Simulate click to open app editor.
      let element = document.createElement('div');
      element.id = 'page-new-app';
      Click.navigateTo(element);
      //==Manage control elements.
      let navElements =
        document.querySelectorAll('#app-editor-box .editor-controls__item');
      navElements[0].querySelector('button').disabled = true;
      navElements[1].querySelector('button').disabled = false;

      //==Prepare the App Editor to show the landing page editor.
      UI.hideElement('#app-editor-pane #form-container');
      UI.showElement('#app-editor-pane #page-container');

      //--Show the current landing page in editor.
      showLandingPageEditor(appData.appmeta, appData.basic);

      //--Set content type.
      AppEditor.content = contentType;

      //==Add existing pages to the preview list.

      //--Reset the app list.
      UI.resetElementText('#app-editor-box #page-list');
      //--Loop through the app's pages.
      for (let page in appData.pages) {
        //-Create new list item.
        let newListItem = document.createElement('page-item');

        //-Initialize the item.
        newListItem.initDataElement(appData.pages[page], page);

        //-Fix scrolling issues for margin-top on listscreen element.
        document.querySelector('#app-editor-box #page-list').onscroll =
        function() {
          //Get current margin value.
          let margin = window
            .getComputedStyle(document.documentElement)
            .getPropertyValue('--listscreen-margin');
          //Get current scroll distance.
          let scroll = document
            .querySelector('#page-list')
            .scrollTop;
          //Add scroll distance to margin (shift up --> negative value).
          let newMargin = parseInt(margin) - scroll;
          //Set new margin.
          document
            .body.style.setProperty('--listscreen-margin', newMargin + 'px');
        };
        //-Assign the current order ID.
        let appList = document.querySelector('#app-editor-box #page-list');
        newListItem.setAttribute('order-id', appList.children.length);
        //-Add item to list.
        appList.appendChild(newListItem);
        //-Update list for new item to aneable drag.
        Drag.updateAppPageList();
      }
    };

  //============================================================================
  /**
   * Function to save the assembled app to the database.                    <br>
   *                                                                        <br>
   * - Loop through all added pages
   *    and assign values according to chosen content.
   *
   * @memberof AppEditor
   */
  let commitApp =
    function() {
      //==Create the appInfo object.
      let appInfo = AppEditor.landing;

      //==Get all PageItem elements from the page list.
      let pageList = document
        .querySelectorAll('#app-editor-box #page-list .page--item');

      //==Create the appPages object.
      let appPages = {};
      //==Start counter.
      let pageCount = 0;
      let errorFound = false;
      //==Loop throuh pages.
      for (var page of pageList) {
        //--Create the newPage object.
        let newPage = {};
        //-Set page type and ID for the newPage object.
        newPage.id = page.page_id;
        newPage.type = page.type;

        if (AppEditor.content === 'guide') {
          //--Use the pageCount number to save the page if content is guide.
          appPages[pageCount] = newPage;
          //-Increment the pageCount.
          pageCount++;
        } else if (AppEditor.content === 'explore') {
          //--Use the assigned number to save the page if content is explore.
          //-Check if assigned number is within bounds.
          if (
            page.querySelector('input').value <=
              page.querySelector('input').getAttribute('max') &&
              page.querySelector('input').value >=
              page.querySelector('input').getAttribute('min') &&
              appPages[page.querySelector('input').value] === undefined) {
            appPages[page.querySelector('input').value] = newPage;
          } else {
            //--Promt user feedback.
            alert(Lang.getString('alertErrorAppSubmission'));
            //--Set error marker.
            errorFound = true;
          }
        }
      }
      //==Check for errors.
      if (!errorFound) {
        //--Complement the appInfo object.
        appInfo = {
          user: __USER.id,
          ...appInfo,
          pages: appPages,
          layout: 'basic'
        };

        //--Create data object to add app type.
        let data = {
          type: 'app',
          data: appInfo
        };
        Data.validateJSON(data);
        //--Promt user feedback.
        alert(Lang.getString('alert_app_success'));
      }
    };

  //============================================================================
  /**
   * Function to save an assembled CUBE page to the database.               <br>
   *                                                                        <br>
   * - Get the base page, interaction page, media content, and related pages.
   *
   * @memberof AppEditor
   */
  let commitCubePage =
    function() {
      //==Ask for user confirmation - CUBE cannot be changed.
      if (confirm(Lang.getString('confirm_cube_entry'))) {
        //==Create the cube data object.
        let cubeData = {};

        //==Get base page element.
        let basePage =
          document.querySelector(
            '#app-editor-box #page-container #cubescreen .screen'
          );

        //==Get the interaction page preview element.
        let interactPreview =
          document
            .querySelector(
              '#app-editor-box #preview__top .preview_pane__body .screen'
            );
        if (interactPreview) {
          console.log(interactPreview.page_id);
          //--Add the interaction page ID to the cube data object.
          cubeData.interact = {
            type: 'question',
            id: interactPreview.page_id
          };
        }

        //==Get the media content preview element.
        let mediaPreview =
          document
            .querySelector(
              '#app-editor-box #preview__behind .preview_pane__body'
            );
        //--Create the media object.
        let mediaArray = {};
        if (mediaPreview.mediaJSON) {
          //--Get the media data.
          mediaArray = JSON.parse(mediaPreview.mediaJSON);
        }
        //--Add the media object to the cube data object.
        cubeData.media = mediaArray;

        //==Get the related pages preview element.
        let pagesPreview =
          document.querySelectorAll(
            '#app-editor-box #preview__bottom .preview_pane__body .screen'
          );
        if (pagesPreview) {
          //--Create related pages array.
          let relatedPages = [];
          //--Loop through pages.
          for (page of pagesPreview) {
            //-Add page type and ID to related pages array.
            relatedPages.push({
              type: page.getAttribute('type'),
              id: page.page_id
            });
          }
          //--Add the related pages array to the cube data object.
          cubeData.relatedPages = relatedPages;
        }

        //==Add base page to the cube data object.
        if (basePage) {
          cubeData.basePage = {
            type: basePage.getAttribute('type'),
            id: basePage.page_id
          };

          //==Create the data object to add 'cube' type.
          let data = {
            type: 'cube',
            data: cubeData
          };
          //==Validate the data object.
          Data.validateJSON(data);
        }
      }
    };

  //============================================================================
  /**
   * Function to save the assembled landing page to the database.           <br>
   *                                                                        <br>
   * - Get the appmeta page as well as the selected basic pages.
   * @memberof AppEditor
   */
  let commitLandingPage =
    function() {
      let container = document.querySelector('#app-editor-box #page-container');
      //==Get the EditorPages from the container.
      let items = container.querySelectorAll('editor-page');

      //==Create page object.
      let page = {};
      //--Create object for basic pages.
      page['basic'] = {};

      //==Check the EditorPages
      for (let div of items) {
        try {
          if (div.querySelector('.small-screen').type === 'appmeta') {
            //--Assign the page ID.
            page[div.querySelector('.small-screen').type] =
                div.querySelector('.small-screen').page_id;
          } else {
            //--Add available basic pages.
            if (div.querySelector('.small-screen').type != undefined) {
              //--Assign the page ID.
              page['basic'][div.querySelector('.small-screen').type] =
                  div.querySelector('.small-screen').page_id;
            }
          }
        } catch (e) {
          console.log('No page selected!');
        }
      }
      //==Save landing page to the static member.
      AppEditor.landing = page;

      //==Reset container
      container.innerHTML = '';

      //==Show app page order list
      document
        .querySelector('#app-editor-box #page-container__list')
        .classList.remove('hidden');

      //==Manage control elements.
      let controls =
          document.querySelectorAll('#app-editor-box .editor-controls__item');
        //--Disable the 'SAVE META' button
      let controlButton = controls[1].querySelectorAll('button');
      controlButton[0].disabled = true;
      //--Enable the 'ADD PAGE' buttons
      let controlButtons = controls[2].querySelectorAll('button');
      for (let button of controlButtons) {
        button.disabled = false;
      }
    };

  //============================================================================
  /**
   * Function to prepare the editor to create a cube page.                  <br>
   *                                                                        <br>
   *  -  Create an EditorPage.                                              <br>
   *  -  Show the selection pane for the cube base page.                    <br>
   *  -  Create 'COMMIT' button for the cube page.                          <br>
   *  -  Add cube preview pane to container.                                <br>
   *
   * @param {HTMLElement} container - The parent container element.
   *
   * @memberof AppEditor
   * @private
   */
  let createCubePage =
    function(container) {
      //==Create a EditorPage.
      let newPage = document.createElement('editor-page');
      newPage.initElement();
      newPage.id = 'cubescreen';

      //--Add EditorPage to container.
      container.appendChild(newPage);
      //--Set page position.
      newPage.cube(container);
      //--Add buttons to page.
      newPage.attachButton('top', 'top');
      newPage.attachButton('bottom', 'bottom');
      newPage.attachButton('behind', 'behind');

      //==Show the selection pane for the cube base page.
      showAppEditorSelectorPane('cube');

      //==Create 'COMMIT' button for the cube page.
      let commitButton = document.createElement('button');
      commitButton.classList.add('button__commitPage', 'button', 'btn');
      //--Set label.
      commitButton.innerHTML = Lang.getString('commitCube');
      //--Add click listener.
      commitButton.onclick = function() {
        commitCubePage();
      };
      //--Add button to container.
      container.appendChild(commitButton);

      //==Add cube preview pane to container.
      let promises = [];
      //--Create promise to retrieve template html file.
      promises
        .push(Data.getFile('app-editor/', 'cube-preview.template', 'html'));
      //--Resolve promises made above.
      Promise.all(promises).then(function() {
        //-Create preview container.
        let contentPreview = document.createElement('div');
        contentPreview.classList.add('cube_content_preview');
        //-Add preview container to parent container.
        container.appendChild(contentPreview);
        //-Add the preview template to the container.
        let template = (arguments[0][0][0]).innerHTML;
        template = eval('`' + template + '`');

        contentPreview.innerHTML = template;
        //-Add Symbols to preview headers.
        contentPreview.querySelector('#preview__top > div.preview_pane__header')
          .innerHTML = UI.createIconBox('top').innerHTML;
        contentPreview.querySelector('#preview__bottom > div.preview_pane__header')
          .innerHTML = UI.createIconBox('bottom').innerHTML;
        contentPreview.querySelector('#preview__behind > div.preview_pane__header')
          .innerHTML = UI.createIconBox('behind').innerHTML;
      }.bind(container));
    };

  //============================================================================
  /**
   *  Function to create the selection grid for the chosen page type.       <br>
   *
   * @param {string} pageType - The page type.
   * @memberof AppEditor
   */
  function createEditorGrid(pageType) {
    //==Get the parent container.
    let parent = document.querySelector('#app-editor-box .select-popup-grid');
    //--Show the parent container.
    parent.classList.remove('hidden');

    //==Check page type.
    if (pageType === 'room') {
      //--Do not filter language for the room page type.
      Cards.assambleGrid(pageType, parent, false);
    } else {
      Cards.assambleGrid(pageType, parent, true);
    }
  }

  //============================================================================
  /**
   * Function to create the file upload for the CUBE media.                 <br>
   *
   * @param {string} mediaType - The media type.
   *
   * @memberof AppEditor
   */
  let createUpload =
    function(mediaType) {
      //==Get the parent container.
      let parent = document
        .querySelector('#app-editor-box .select-upload-pane');
      //--Show the parent container.
      parent.classList.remove('hidden');

      //==Check for the correct media type.
      if (mediaType === 'image') {
        //--Create an input field.
        let input = document.createElement('input');

        //--Show the preview phone.
        let phone = new PreviewPhone();
        let layout = 'media' + '/' + 'basic';
        let parentPhone = Phone.findActivePreviewPhone();
        phone.initElement({}, layout, parentPhone);

        //--Set input attributes.
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/png, image/jpeg');
        //--Set the change listener.
        input.onchange = function(e) {
          //-Get the preview screen element.
          let output = document
            .querySelector('#app-editor-box .cube_image_output img');
          //-Get the chosen image source & file.
          output.src = URL.createObjectURL(event.target.files[0]);
          output.file = event.target.files[0];
          //-Show the 'ADD TO APP' button.
          document.querySelector(
            '#app-editor-box #phone-container .btn_add-page-to-app'
          ).classList.remove('hidden');
        };
        //--Add input field to parent.
        parent.appendChild(input);
      } else {
        console.log('Media type not supported.');
      }
    };

  //============================================================================
  /**
   * Function to show the editor selection pane for the desired page type.
   *
   * @param {string} pageType - The desired page type.
   *
   * @memberof AppEditor
   */
  let showAppEditorSelectorPane =
    function(pageType) {
      //==Check for page type.
      if (pageType) {
        //==Get the selection pane container.
        let area = document.querySelector('#app-editor-box #page-select-popup');
        //--Show the selection pane container.
        area.classList.remove('hidden');

        //==Initialize 'CLOSE' button.
        area.querySelector('.btn_close_app_popup').onclick = function() {
          //--Reset the selection pane container.
          area.classList.add('hidden');
          area.querySelector('.select-popup-pages').classList.add('hidden');
          area.querySelector('.select-popup-pages.__interact')
            .classList.add('hidden');
          area.querySelector('.select-popup-pages.__media')
            .classList.add('hidden');
          area.querySelector('.select-popup-pages.__cubeinteract')
            .classList.add('hidden');
          area.querySelector('.select-upload-pane').classList.add('hidden');
          area.querySelector('.select-upload-pane').innerHTML = '';
          area.querySelector('.select-popup-grid').classList.add('hidden');
          area.querySelector('.select-popup-grid').innerHTML = '';

          //--Reset the preview screen.
          document.querySelector('#app-editor-box #phone-container .screen')
            .innerHTML = '';
          document.querySelector(
            '#app-editor-box #phone-container .btn_add-page-to-app'
          ).classList.add('hidden');

          //--Reset the cube pane.
          if (pageType === 'cube') {
            document.querySelector('#app-editor-box #page-container')
              .innerHTML = '';
          }
        };

        //==Check page utility and type.
        if (['single', 'cube', 'cubesingle'].includes(pageType)) {
          //--Show standard grid container.
          area.querySelector('.select-popup-pages').classList.remove('hidden');
          area.setAttribute('targetID', pageType);
        } else if (pageType === 'room') {
          //--Create room grid.
          createEditorGrid('room');
          area.setAttribute('targetID', pageType);
        } else if (pageType === 'interaction') {
          //--Show interaction grid container.
          area.querySelector('.select-popup-pages.__interact')
            .classList.remove('hidden');
          area.setAttribute('targetID', pageType);
        } else if (pageType === 'media') {
          //--Show media upload container.
          area.querySelector('.select-popup-pages.__media')
            .classList.remove('hidden');
          area.setAttribute('targetID', pageType);
        } else if (pageType === 'interact') {
          //--Show single interaction grid container.
          area.querySelector('.select-popup-pages.__cubeinteract')
            .classList.remove('hidden');
          area.setAttribute('targetID', pageType);
        }
      }
    };

  //============================================================================
  /**
   * Function to add the landing page to the app.                           <br>
   *                                                                        <br>
   * - Adds EditorPages to contain the basic page types
   * (info, hours & admission.)
   *
   * @param {string} appmetaID - The ID of the appmeta page.
   * @param {Object} [basic=undefined]
   * The initial ID(s) of the assigned basic page(s).
   *
   * @memberof AppEditor
   */
  let showLandingPageEditor =
    async function(appmetaID, basic = undefined) {
      //==Reset preview phone screen.
      document.querySelector(
        '#app-editor-box #app-editor-page-preview .screen'
      ).innerHTML = '';

      //==Get parent container.
      let container = document.querySelector('#app-editor-box #page-container');
      container.classList.remove('hidden');
      //--Reset the form container.
      container.innerHTML = '';

      //==Create central EditorPage element for landing page.
      let centerPage = document.createElement('editor-page');
      centerPage.initElement();
      container.appendChild(centerPage);
      centerPage.centerTop(container);
      centerPage.addPage(appmetaID, 'appmeta');

      //==Create EditorPage element for hours basic page.
      let bottomPage = document.createElement('editor-page');
      bottomPage.initElement();
      container.appendChild(bottomPage);
      bottomPage.centerBottom(container);
      //--Check if hours ID is available.
      if (basic && basic.hours) {
        bottomPage.addPage(basic.hours, 'hours');
      }
      //--Add button to element.
      bottomPage.attachButton('bottom', 'hours');
      bottomPage.classList.add('hours');
      //--Add visual connector.
      let connector = new Connector({
        ele1: centerPage,
        ele2: bottomPage,
        lineStyle: '1px solid red'
      });
      SetupConectorUpdate(connector, centerPage, bottomPage);

      //==Create EditorPage element for info basic page.
      let bottomLeftPage = document.createElement('editor-page');
      bottomLeftPage.initElement();
      container.appendChild(bottomLeftPage);
      bottomLeftPage.leftBottom(container);
      //--Check if info ID is available.
      if (basic && basic.info) {
        bottomLeftPage.addPage(basic.info, 'info');
      }
      //--Add button to element.
      bottomLeftPage.attachButton('bottom', 'info');
      bottomLeftPage.classList.add('info');
      //--Add visual connector.
      connector = new Connector({
        ele1: centerPage,
        ele2: bottomLeftPage,
        lineStyle: '1px solid red'
      });
      SetupConectorUpdate(connector, centerPage, bottomLeftPage);

      //==Create EditorPage element for admission basic page.
      let bottomRightPage = document.createElement('editor-page');
      bottomRightPage.initElement();
      container.appendChild(bottomRightPage);
      bottomRightPage.rightBottom(container);
      //--Check if admission ID is available.
      if (basic && basic.admission) {
        bottomRightPage.addPage(basic.admission, 'admission');
      }
      //--Add button to element.
      bottomRightPage.attachButton('bottom', 'admission');
      bottomRightPage.classList.add('admission');
      //--Add visual connector.
      connector = new Connector({
        ele1: centerPage,
        ele2: bottomRightPage,
        lineStyle: '1px solid red'
      });
      SetupConectorUpdate(connector, centerPage, bottomRightPage);
    };

  //============================================================================
  /**
   * Function to initialize the metadata form for the App Editor.           <br>
   *                                                                        <br>
   *  -  Display the form for entering.                                     <br>
   *  -  Add additional functionality to the 'COMMIT' button.               <br>
   *  -  Show layout in preview phone.                                      <br>
   *  -  Reset the app page list in the page pane.                          <br>
   *  -  Manage control elements.                                           <br>
   *
   * @memberof AppEditor
   */
  let showMetaDataEditor =
    async function() {
      console.log('Add App metadata');
      //==Locate the app form container.
      let container =
        document.querySelector(
          '#app-editor-box #app-editor-pane #form-container'
        );

      //==Set the basic layout type.
      let type = 'appmeta/basic.layout';

      //==Create the form with set layout.
      await UI.createForm(type, container).then(function() {
        //--Get the commit button
        let button =
          document.querySelector(
            '#app-editor-box #app-editor-pane #form-container .btn--page_commit'
          );

        //--Add event listener to advance editor to landing page.
        button.addEventListener('click', function() {
          //-Check for a data error.
          if (!__DATA_ERROR) {
            //Hide form container.
            document
              .querySelector('#app-editor-pane #form-container')
              .classList
              .add('hidden');
            //Show landing page container.
            document
              .querySelector('#app-editor-pane #page-container')
              .classList
              .remove('hidden');
          } else {
            //==Log the error to console.
            console.log('A data error occured!');
          }
        });
      });

      //==Show layout in preview phone.
      let promises = [];
      //--Create promise to retrieve template html file.
      promises
        .push(Data.getFile('preview-phone/templates/', type, 'html'));
      //--Resolve promises made above.
      Promise.all(promises).then(function() {
        //-Prepare preview phone.
        let parent = Phone.findActivePreviewPhone();
        let layout = type.split('/');
        Phone.setPhoneAttributes(
          parent, '', layout[0], layout[1].split('.')[0]
        );
        //-Add template to phone.
        parent.innerHTML = (arguments[0][0][0]).innerHTML;
      });

      //==Show the form container.
      container.classList.remove('hidden');

      //==Reset the app page list in the page pane.
      document.querySelector('#app-editor-box #page-list').innerHTML = '';

      //==Manage control elements.
      let controls =
        document.querySelectorAll('#app-editor-box .editor-controls__item');
      //--Disable form creation button.
      controls[0].querySelector('button').disabled = true;
    };

  //============================================================================
  /**
   * Function to show the appropriate selection screen for an advanced page.<br>
   *
   * @param {string} category - The page category to be added to the app.
   *
   * @memberof AppEditor
   */
  let showPageSelection =
    function(category) {

      //==Get the page container.
      let container = document.querySelector('#app-editor-box #page-container');
      container.classList.remove('hidden');

      //==Reset page container.
      container.innerHTML = '';

      //==Check page category and show selection pane accordingly.
      if (category === 'single') {
        showAppEditorSelectorPane(category);
      } else if (category === 'cube') {
        createCubePage(container);
      } else if (category === 'room') {
        showAppEditorSelectorPane(category);
      } else if (category === 'interaction') {
        showAppEditorSelectorPane(category);
      } else {
        console.log('Nothing to do...');
      }
    };

  //============================================================================

  //==Add functions to the namespace object scope.
  this.addCubeToApp = addCubeToApp; //--Called 1 in: data.util.js
  this.addPageToApp = addPageToApp; //--Called 1 in: home.html (BUTTON)

  this.changeApp = changeApp;       //--Called 1 in: dash-item.class.js (BUTTON)

  this.commitApp = commitApp;       //--Called 1 in: home.html (BUTTON)
  this.commitLandingPage = commitLandingPage; //--Called 1 in: home.html (BUTTON)

  this.createEditorGrid = createEditorGrid;   //--Called 7 in: home.html (BUTTON)
  this.createUpload = createUpload; //--Called 1 in: home.html (BUTTON)

  this.showAppEditorSelectorPane = showAppEditorSelectorPane; //--Called 3 in: editor-page.class.js (BUTTON)
  this.showLandingPageEditor = showLandingPageEditor;         //--Called 1 in: home.html (BUTTON)
  this.showMetaDataEditor = showMetaDataEditor;               //--Called 1 in: home.html (BUTTON)

  this.showPageSelection = showPageSelection; //--Called 4 in: home.html (BUTTON)

  //============================================================================
}).apply(AppEditor);
//==============================================================================
//==EOF=========================================================================
