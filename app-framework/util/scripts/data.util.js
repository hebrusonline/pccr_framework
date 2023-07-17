//==============================================================================
/**
 * @file This file contains utility functions related to handeling app data.
 *
 * <pre>
 *
*==Method List:======================================================================================= <br>
* | Name             | Description                                                                    |
* ----------------   | ------------------------------------------------------------------------------ |
* | [buildCommitObject]{@link Data.buildCommitObject}| Build the JSON object for the given form elements and PageType.                |
* | [commitForm]{@link Data.commitForm}       | Function to handle the form 'COMMIT'.                                          |
* | [commitPageData]{@link Data.commitPageData}   | Function to persist page data to the Firebase datastore.                       |
* | [deleteApp]{@link Data.deletePage}        | Function to delete an existing app data document from the firebase datastore.  |
* | [deletePage]{@link Data.deletePage}       | Function to delete an existing page data document from the firebase datastore. |
* | [getFile]{@link Data.getFile}          | Function to request a file from the server.                                    |
* | [getPageData]{@link Data.getPageData}      | Function to get the data of a single page with a given ID and PageType.        |
* | [getPageTypeData]{@link Data.getPageTypeData}  | Function to get the data of all pages of a certain PageType.                   |
* | [hideApp]{@link Data.hideApp}          | Function to remove an app page from the 'APPFOLDER' datastore.                 |
* | [publishApp]{@link Data.publishApp}       | Function to add an app page to the 'APPFOLDER' datastore.                      |
* | [removeAllText]{@link Data.removeAllText}    | Function to remove text from a HTMLElement.                                    |
* | [renderItemData]{@link Data.renderItemData}   | Function render data of a single page with given page ID and PageType.         |
* | [showAppStats]{@link Data.showAppStats}     | Function to show the statistics for the application.                          |
* | [syntaxHighlight]{@link Data.syntaxHighlight}  | Function to provide syntax highlighting for JSON objects.                      |
* | [updatePageData]{@link Data.updatePageData}   | Function to update an existing page data document in the firebase datastore.   |
* | [validateJSON]{@link Data.validateJSON}     | Function to validate a JSON object against a JSONSchema.                       |
* </pre>
 * @author       Hebrus
 *
 * @see {@link Data} - The Data namespace.
 */
//==============================================================================

/**
 * The Data namespace.
 * @namespace
 */
var Data = {};

/**
 * Global data error marker.
 */
let __DATA_ERROR = false;

(function() {
  //============================================================================
  /**
   * Build the JSON object for the given form elements and PageType.
   *
   * @param {HTMLCollection} object - A {@link Glossary.datatype#HTMLCollection|HTMLCollection} object containing the form objects.
   * @param {string} pageType - A {@link Glossary.PageType|Page Type} string.
   *
   * @return {Object} A JSON {@link Glossary.datatype#object|object} containing the PageType and page data document.
   * @memberof Data
   * @private
   */
  let buildCommitObject =
    function(object, pageType) {
      //==Create dataJson object.
      let dataJSON = {};
      //==Loop through elements. > Start at 1: skip the header DOM element.
      for (let i = 1; i < object.length; i++) {
        //==Create outerJSON object.
        let outerJSON = {};
        //--Get outerName name.
        let outerName = object[i].getAttribute('name');
        if (outerName) {
          dataJSON[outerName] = {};
        }

        //==Handle an array form element.
        if (object[i].classList.contains('__array')) {
          console.log('An Array in an Object!');
          let arrayChildren = object[i].children;
          console.log(arrayChildren);
          let arrayName = '';
          let arrayData = [];
          //-- Loop through array content. > Skip add button at the end.
          for (let k = 0; k < arrayChildren.length - 1; k++) {
            if (k == 0) {
              arrayName = arrayChildren[k].getAttribute('name');
            }
            console.log(arrayChildren[k]);
            //--Get data of single array entry.
            let res = buildCommitObject(arrayChildren[k].children);
            //--Add entry to array.
            arrayData.push(res.data);
          }
          //==Add array to dataJSON object.
          dataJSON[arrayName] = arrayData;
        } else {
          //==Handle regular form elements.
          let outerChildren = object[i].children;

          for (let j = 0; j < outerChildren.length; j++) {
            //==Check for nested form objects.
            if (outerChildren[j].classList.contains('pccr-object')) {
              let innerName = outerChildren[j].getAttribute('name');
              //--Get data of inner object.
              let innerJSON = buildCommitObject(outerChildren[j].children);
              //--Add data.
              outerJSON[innerName] = innerJSON;
              dataJSON[outerName] = outerJSON;
              console.log(dataJSON);
              //==Handle inner form element items.
            } else if (outerChildren[j].classList.contains('pccr-data')) {
              console.log('An Item in an Object!');
              let innerJSON = outerChildren[j].parentNode.getData();
              //--Get all key elements.
              for (let key in innerJSON) {
                dataJSON[key] = innerJSON[key];
              }
              //==Handle outer form element items.
            } else if (!outerChildren[j].classList.contains('form-header')) {
              console.log('An Item on base Object!');
              let innerJSON = outerChildren[j].getData();
              //--Get all key elements.
              for (let key in innerJSON) {
                console.log(outerName);
                dataJSON[outerName][key] = innerJSON[key];
              }
            }
          }
        }
      }
      //==Handle the boolean for the 'closed' field in hours page.
      if (pageType === 'hours') {
        for (let field in dataJSON) {
          console.log(field);
          if (dataJSON[field].closed) {
            dataJSON[field] = {};
            dataJSON[field].closed = true;
          } else {
            delete dataJSON[field].closed;
          }
        }
      }
      //==Create final data set.
      let returnJSON = {};
      //==Add the type to the data set.
      returnJSON.type = pageType;
      //==Add the data to the data set.
      returnJSON.data = dataJSON;

      //==Return the data set.
      return returnJSON;
    };

  //============================================================================
  /**
   * Function to handle the form 'COMMIT'.
    * @param {HTMLElement} element - The form 'COMMIT' button {@link Glossary.datatype#HTMLElement|HTMLElement}.
    * @param {string} [pageID] - An ID {@link Glossary.datatype#string|string} of an existing page.
   * @memberof Data
   */
  let commitForm =
    async function(element, pageID = undefined) {
      //==Get container.
      let container = element.parentNode;
      //==Check for appmeta ==> issue dialog: 'UNCHAGABLE'
      if (container.type === 'appmeta' &&
        confirm(Lang.getString('confirm_meta_entry')))
      {
        //--Extract the child elements of the Object container.
        let dataFields = container.children;
        //--Create results field.
        let outputJSON = {};
        //--Extract the data relevant data set.
        outputJSON = buildCommitObject(dataFields, container.type);
        //--Add the layout indicator to data set.
        outputJSON.data.layout = container.layout;

        //==Show final JSON in console.
        console.log(outputJSON);

        let confirmedOutput = await validateJSON(outputJSON, pageID);
        if (confirmedOutput) {
          __DATA_ERROR = false;
        } else {
          console.log('A data error occured!');
          __DATA_ERROR = true;
        }
        //==Check for !appmeta to catch aborted dialog
      }else if(container.type != 'appmeta'){
        //--Extract the child elements of the Object container.
        let dataFields = container.children;
        //--Create results field.
        let outputJSON = {};
        //--Extract the data relevant data set.
        outputJSON = buildCommitObject(dataFields, container.type);
        //--Add the layout indicator to data set.
        outputJSON.data.layout = container.layout;

        //==Show final JSON in console.
        console.log(outputJSON);

        let confirmedOutput = await validateJSON(outputJSON, pageID);
        if (confirmedOutput) {
          __DATA_ERROR = false;
        } else {
          console.log('An error occured!');
          __DATA_ERROR = true;
        }
      }else{
        //==Keep form visible.
        __DATA_ERROR = true;
      }
    };

  //============================================================================
  /**
   * Function to persist page data to the Firebase datastore. <br>
   * <b>Must</b> only be called with a valid object (> i.e. after Data.validateJSON).
   * Handles redirection for certain page types.
   * @memberof Data
   * @param {Object} data - A JSON {@link Glossary.datatype#object|object} containing the PageType & page data document.
   * @see {@link
      https://firebase.google.com/docs/firestore/manage-data/add-data|Firebase}
      - The Firebase Documentation.
   */
  let commitPageData =
    function(data) {
      //==Create firestore reference.
      let database = firebase.firestore();
      //==Add page data document to firestore.
      database
        .collection(firebase.auth().currentUser.uid)
        .doc('pages')
        .collection(data.type)
        .add(data.data)
        .then(function(docRef) {
          console.log('Document successfully written! ID: ', docRef);
          //==Added functions for certain page types.
          if (
            ['text', 'object', 'person', 'event', 'place', 'info', 'hours', 'admission']
              .includes(data.type))
          {
            //--Go back to page type selection.
            Click.backTargetHandler('page_form');
          }
          if (data.type === 'appmeta') {
            AppEditor.showLandingPageEditor(docRef.id);
            //--Manage control elements.
            let controls = document.querySelectorAll('#app-editor-box .editor-controls__item');
            //--Enable landnig page creation.
            controls[1].querySelector('button').disabled = false;
          }
          if (data.type === 'room') {
            Click.backTargetHandler('room-box');
          }
          if (data.type === 'quiz') {
            Click.backTargetHandler('interact-box');
          }
          if (data.type === 'question') {
            //--Add question preview.
            QuizEditor.addPreview(data.data, docRef.id);
          }
          if (data.type === 'cube') {
            //--Add cube and close cube preview.
            AppEditor.addCubeToApp(docRef.id);
          }
          if (data.type === 'app') {
            //--Close app editor.
            Click.backTargetHandler('goto-apps');
          }
        })
        .catch(function(error) {
          console.error('Error writing document: ', error);
        });
    };

  //============================================================================
  /**
   * Function to delete an existing app data document from the firebase datastore.
   *
   * @param {string} appID - An ID {@link Glossary.datatype#string|string} of an existing page.
   * @memberof Data
   */
  let deleteApp =
      function(appID) {
        //==create firestore reference
        let database = firebase.firestore();
        //==add data document to firestore
        database
          .collection(firebase.auth().currentUser.uid)
          .doc('pages')
          .collection('app')
          .doc(appID)
          .delete()
          .then(function() {
            console.log('Document successfully deleted!');
          }).catch(function(error) {
            console.error('Error removing document: ', error);
          });
      };

  //============================================================================
  /**
   * Function to delete an existing page data document from the firebase datastore.
   *
   * @param {string} pageType - A {@link Glossary.PageType|Page Type} String
   * @param {string} pageID - An ID {@link Glossary.datatype#string|string} of an existing page.
   * @memberof Data
   * @see The {@link
      https://firebase.google.com/docs/firestore/manage-data/add-data|Firebase}
      Documentation.
   */
  let deletePage =
    function(pageType, pageID) {
      //==create firestore reference
      let database = firebase.firestore();
      //==add data document to firestore
      database
        .collection(firebase.auth().currentUser.uid)
        .doc('pages')
        .collection(pageType)
        .doc(pageID)
        .delete()
        .then(function() {
          //==Added functions for certain page types.
          if (['text', 'object', 'person', 'event', 'place',
            'info', 'hours', 'admission']
            .includes(pageType))
          {
            Click.backTargetHandler('page_form');
          } else {
            console.log('What am I doung here?');
          }
          console.log('Document successfully deleted!');
        }).catch(function(error) {
          console.error('Error removing document: ', error);
        });
    };

  //============================================================================
  /**
   * Function to request a file from the server.
   * @memberof Data
   *
   * @param {string} path - The directory path to get the file from.
   * @param {string} name - The name of the desired file.
   * @param {string} type - The file type extension ['json', 'html'].
   *
   * @return {Promise}
   *  {@link Glossary.datatype#Promise|Promise} to get the file of <b>type</b> with <b>name</b> from <b>path</b>.
   * @see w3schools: {@link https://www.w3schools.com/js/js_ajax_http.asp|AJAX}
   */
  let getFile =
    function(path, name, type) {
      //==Returns a promise
      return new Promise(function(resolve, reject) {
        var httpRequest = new XMLHttpRequest();

        //--Resolve HTTP request.
        httpRequest.onreadystatechange = function() {
          if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
              //-Init 'response' variable.
              let response = null;
              //-Handle JSON file===============================================
              if (type === 'json') {
                //Parse JSON object.
                response = JSON.parse(httpRequest.responseText);
              }
              //-Handle HTML file===============================================
              if (type === 'html') {
                let parser = new DOMParser();
                //Parse HTML DOM to get template via querySelector
                response = parser
                  .parseFromString(httpRequest.responseText, 'text/html')
                  .querySelectorAll('.template');

				console.log(path, name, type, response);
				
                removeAllText(response[0]);
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
    };

  //============================================================================
  /**
   * Function to get the data of a single page with a given ID and PageType.
   * @memberof Data
   * @param {string} pageID - An ID {@link Glossary.datatype#string|string} of an existing page.
   * @param {string} pageType - A {@link Glossary.PageType|Page Type} String.
   *
   * @return {Object} Firebase document {@link Glossary.datatype#object|object}.
   */
  let getPageData =
    async function(pageID, pageType) {
      var database = firebase.firestore();
      //==Get data document from firestore.
      try {
        let result = await database
          .collection(firebase.auth().currentUser.uid)
          .doc('pages')
          .collection(pageType)
          .doc(pageID)
          .get();

        return result;
      }catch (error) {
        console.log('Error getting documents: ', error);
      }
    };

  //============================================================================
  /**
   * Function to get the data of all pages of a certain PageType.
   * @memberof Data
   * @param {string} type - A {@link Glossary.PageType|Page Type} String.
   *
   * @return {Object} Firebase document {@link Glossary.datatype#object|object}.
   */
  let getPageTypeData =
    async function(type) {
      //==Create firestore reference
      let database = firebase.firestore();

      //==Get data document from firestore.
      try {
        let result = await database
          .collection(firebase.auth().currentUser.uid)
          .doc('pages')
          .collection(type)
          .get();

        return result;

      } catch (error) {
        console.log('Error getting documents: ', error);
      }
    };

  //============================================================================
  /**
   * Function to remove an app page from the 'APPFOLDER' datastore. <br>
   * <b>Must</b> only be called with a valid object.
   *
   * @memberof Data

   * @param {Object} data - A JSON {@link Glossary.datatype#object|object} containing the appdata.
   * @see {@link
      https://firebase.google.com/docs/firestore/manage-data/add-data|Firebase}
      - The Firebase Documentation.
   */
  let hideApp =
    function(data) {
      //==create firestore reference
      let database = firebase.firestore();
      console.log(data);
      //==Add data document to firestore
      database
        .collection(__CONFIG.appfolder) //==APPFOLDER!
        .doc(data.published)
        .delete()
        .then(function() {
          console.log('Document successfully deleted!');
          //--Change the published indicator in the referenced app page.
          database
            .collection(data.user)
            .doc('pages')
            .collection('app')
            .doc(data.id)
            .set({
              published: false
            }, {
              merge: true
            })
            .then(function() {
              Dash.showAppList();
            })
            .catch(function(error) {
              console.error('Error writing document: ', error);
            });
        })
        .catch(function(error) {
          console.error('Error writing document: ', error);
        });
    };

  //============================================================================
  /**
   * Function to add an app page to the 'APPFOLDER' datastore.  <br>
   * <b>Must</b> only be called with a valid object.
   *
   * @memberof Data
   *
   * @param {Object} data - A JSON {@link Glossary.datatype#object|object} containing the appdata information.
   * @see {@link
      https://firebase.google.com/docs/firestore/manage-data/add-data|Firebase}
      - The Firebase Documentation.
   */
  let publishApp =
    function(data) {
      //==create firestore reference
      let database = firebase.firestore();
      //==add data document to firestore
      database
        .collection(__CONFIG.appfolder) //==APPFOLDER!
        .add(data)
        .then(function(docRef) {
          console.log('Document successfully written! ID: ', docRef.id);
          //--Change the published indicator in the referenced app page.
          database
            .collection(data.user)
            .doc('pages')
            .collection('app')
            .doc(data.id)
            .set({
              published: docRef.id
            }, {
              merge: true
            })
            .then(function() {
              Dash.showAppList();
            })
            .catch(function(error) {
              console.error('Error writing document: ', error);
            });
        })
        .catch(function(error) {
          console.error('Error writing document: ', error);
        });
    };

  //============================================================================
  /**
   * Function render data of a single page with given page ID and PageType.
   * @memberof Data
   * @param {string} pageID - An ID {@link Glossary.datatype#string|string} of an existing page.
   * @param {string} type - A {@link Glossary.PageType|Page Type} String.
   * @param {boolean} [change=false] - {@link Glossary.datatype#boolean|boolean} indicator for a change request.
   */
  let renderItemData =
    function(pageID, type, change = false) {
      var database = firebase.firestore();
      database
        .collection(firebase.auth().currentUser.uid)
        .doc('pages')
        .collection(type)
        .doc(pageID)
        .get()
        .then(function(doc) {
          if (doc.exists) {
            let data = doc.data();
            data.id = pageID;
            console.log('Document data:', doc.data());
            //==Render raw item data.
            try {
              //==Show data in 'RAW' tab.
              UI.showRawPageData(data);
              //==Render page in preview phone.
              let phoneData = {};
              phoneData.data = data;
              phoneData.type = type;
              Phone.renderPreviewPhone(phoneData);
            } catch (e) {
              console.log('Error:', e);
            }

            //==In case of change request create approriate input form.
            if (change) {
              //--Get the target for the form to be displysed.
              let target = {};
              //-Handle question page type.
              if (type === 'question') {
                target = document.querySelector(
                  '#quiz-editor-pane #form-container'
                );
              } else {
                //-Handle the information page types (appmeta is not allowed to change!).
                target = document.querySelector(
                  '#info-page-box #form-container'
                );
              }
              //--Create the page form and plug in the given data values.
              UI.createForm(type + '/' + data.layout + '.layout', target, data);
            }
          } else {
            console.log('No such document!');
          }
        });
    };

  //============================================================================
  /**
   * Function to show the statistics for the application. <br>
   * <b>Must</b> only be called with a valid object.
   * @memberof Data
   * @access private
   * @param {Object} appData - A JSON {@link Glossary.datatype#object|object} containing the appdata document.
   * @see The {@link
      https://firebase.google.com/docs/firestore/manage-data/add-data|Firebase}
      Documentation.
   * @see The {@link
      https://developers.google.com/chart|Google Charts}
      Documentation.
   */
  let showAppStats =
    function(appData) {
      console.log(appData);
      //==Create firestore reference.
      let database = firebase.firestore();

      //==Get the stat data.
      try {
        database
          .collection(__USER.id)
          .doc('analytics')
          .collection('visits')
          .where('appOriginID', '==', appData.id)
          .get()
          .then(function(data) {
            //--Total identifeid visits.
            let totalNumber = 0;
            let visits = [];
            let consumers = [];

            //--Check the visits.
            data.forEach(function(doc) {
              visits.push(doc.data().visit);
              consumers.push(doc.data().consumerID);
              totalNumber++;
            });

            //--Uniquely identifeid consumers.
            let uniqueNumber = [...new Set(consumers)].length;

            //--Initialize data sets.
            let pages = [];
            let times = [];
            let weekdays = [];
            let pageTypes = [];
            let pageIndex = [];
            let pageIDs = [];

            //--Assigns the relevant data.
            for (visit in visits) {
              if (visits[visit] != null) {
                pages.push(visit.length);
                weekdays.push(new Date(visits[visit][0].time).getDay());

                for (page in visits[visit]) {
                  times.push(visits[visit][page].time);
                  pageTypes.push(visits[visit][page].pageType);
                  pageIndex.push(visits[visit][page].pageIndex);
                  pageIDs.push(visits[visit][page].pageId);
                }
              }
            }

            //==Log the prepared data.
            console.log(pages, times, weekdays, pageTypes, pageIDs);

            //==Insert the numbers.
            document.querySelector('#dash-box #dash__stats .total').innerHTML =
              Lang.getString('total') + ' ' + totalNumber;
            document.querySelector('#dash-box #dash__stats .unique').innerHTML =
              Lang.getString('unique') + ' ' + uniqueNumber;

            //==Prepare the charts.
            google.charts.load('current', {
              'packages': ['corechart']
            });
            google.charts.setOnLoadCallback(function() {
              //==Prepare the 'WEEKDAY' chart.
              //--Get the container.
              let container = document.querySelector(
                '#dash-box #dash__stats .weekdays'
              );
              //--Init data.
              let weekArray = [
                ['Weekday', 'Access'],
                [Lang.getString('sunday'), 0],
                [Lang.getString('monday'), 0],
                [Lang.getString('tuesday'), 0],
                [Lang.getString('wednesday'), 0],
                [Lang.getString('thursday'), 0],
                [Lang.getString('friday'), 0],
                [Lang.getString('saturday'), 0]
              ];
              for (let i = 0; i < weekdays.length; i++) {
                //-Count the activity per weekday.
                weekArray[weekdays[i] + 1][1]++;
              }
              //--Set data.
              var data = google.visualization.arrayToDataTable(weekArray);
              //--Set title.
              var options = {
                title: Lang.getString('activity_weekday'),
                tooltip: {
                  isHtml: true
                }
              };
              //--Create a pie chart.
              var chart = new google.visualization.PieChart(container);
              chart.draw(data, options);

              //==Prepare the 'TIMES' chart.
              //--Get the container.
              container = document.querySelector(
                '#dash-box #dash__stats .times'
              );
              //--Fix the time lables.
              let timeArray = [
                ['Time', Lang.getString('activity')],
                ['0', 0],
                ['1', 0],
                ['2', 0],
                ['3', 0],
                ['4', 0],
                ['5', 0],
                ['6', 0],
                ['7', 0],
                ['8', 0],
                ['9', 0],
                ['10', 0],
                ['11', 0],
                ['12', 0],
                ['13', 0],
                ['14', 0],
                ['15', 0],
                ['16', 0],
                ['17', 0],
                ['18', 0],
                ['19', 0],
                ['20', 0],
                ['21', 0],
                ['22', 0],
                ['23', 0],
                ['24', 0],
              ];

              for (let i = 0; i < times.length; i++) {
                //-Count the activity per hour.
                timeArray[new Date(times[i]).getHours() + 1][1]++;
              }
              //--Set the data.
              data = google.visualization.arrayToDataTable(timeArray);
              //--Set the title.
              options = {
                title: Lang.getString('activity_hour'),
                tooltip: {
                  isHtml: true
                }
              };
              //--Create a bar chart.
              chart = new google.visualization.ColumnChart(container);
              chart.draw(data, options);

              //==Prepare the 'PAGE TYPES' chart.
              //--Get the container.
              container = document.querySelector(
                '#dash-box #dash__stats .page-type'
              );
              //--Set the keys.
              let pageTypeArray = [
                ['Page Type', Lang.getString('activity')]
              ];
              //--Create the set of available page types.
              let uniquePageTypes = [...new Set(pageTypes)];
              for (let i = 0; i < uniquePageTypes.length; i++) {
                pageTypeArray.push([uniquePageTypes[i], 0]);
              }
              for (let i = 0; i < pageTypes.length; i++) {
                //-Count the page type activity.
                pageTypeArray[uniquePageTypes.indexOf(pageTypes[i]) + 1][1]++;
              }
              //--Set the data.
              data = google.visualization.arrayToDataTable(pageTypeArray);

              //--Set the title.
              options = {
                title: Lang.getString('activity_type'),
                tooltip: {
                  isHtml: true
                }
              };
              //--Create a pie chart.
              chart = new google.visualization.PieChart(container);
              chart.draw(data, options);

              //==Prepare the 'ACTUAL PAGE VISITS' chart.
              //--Get the container.
              container = document.querySelector(
                '#dash-box #dash__stats .app-pages'
              );
              //--Set the keys.
              let appPageArray = [
                ['App Page', Lang.getString('activity')]
              ];

              //--Label the basic page types.
              let appPageAux = {};
              for (page in appData.pages) {
                appPageAux[page] = 0;
              }
              appPageAux['appmeta'] = 0;
              appPageAux['info'] = 0;
              appPageAux['hours'] = 0;
              appPageAux['admission'] = 0;
              //--Count the actual pages visited.
              for (let i = 0; i < pageIndex.length; i++) {
                if (pageTypes[i] != 'appmeta' &&
                  pageTypes[i] != 'info' &&
                  pageTypes[i] != 'hours' &&
                  pageTypes[i] != 'admission') {
                  appPageAux[pageIndex[i]]++;
                } else {
                  appPageAux[pageTypes[i]]++;
                }
              }
              //--Inclide the basic pages.
              appPageArray.push(['appmeta', appPageAux['appmeta']]);
              appPageArray.push(['info', appPageAux['info']]);
              appPageArray.push(['hours', appPageAux['hours']]);
              appPageArray.push(['admission', appPageAux['admission']]);
              //--Include the actual pages.
              for (page in appData.pages) {
                appPageArray.push([page, appPageAux[page]]);
              }
              //--Set the data.
              data = google.visualization.arrayToDataTable(appPageArray);

              //--Set the title.
              options = {
                title: Lang.getString('activity_page'),
                tooltip: {
                  isHtml: true
                }
              };
              //--Create column chart.
              chart = new google.visualization.ColumnChart(container);
              chart.draw(data, options);
            }.bind(weekdays, times, pageTypes, pageIDs, pageIndex, appData));
          });
      } catch (error) {
        console.log('Error getting documents: ', error);
      }
      //==Show the stats overlay.
      document.querySelector('#dash-box #dash__stats')
        .classList.remove('hidden');
    };

  //============================================================================
  /**
   * Function to provide syntax highlighting for JSON objects.
   * @memberof Data
   * @param {Object} json - A JSON {@link Glossary.datatype#object|object}.
   * @return {string} The JSON {@link Glossary.datatype#object|object} with highlights.
   * @see {@link http://jsfiddle.net/KJQ9K/554|JSfiddle} - Syntax highlighting.
   * @see This {@link https://stackoverflow.com/questions/12317049/how-to-split-a-long-regular-expression-into-multiple-lines-in-javascript|Stackoverflow}
      entry.
   */
  let syntaxHighlight =
    function(json) {
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
    };

  //============================================================================
  /**
   * Function to update an existing page data document in the firebase datastore.
   *
   * @param {Object} data - An {@link Glossary.datatype#object|object} containing the page data document.
   * @param {string} pageID - An ID {@link Glossary.datatype#string|string} of an existing page.
   * @memberof Data
   * @private
   * @see The {@link
      https://firebase.google.com/docs/firestore/manage-data/add-data|Firebase}
      Documentation.
   */
  let updatePageData =
    function(data, pageID) {
      //==Create firestore reference.
      let database = firebase.firestore();
      //==Add data document to firestore.
      database
        .collection(firebase.auth().currentUser.uid)
        .doc('pages')
        .collection(data.type)
        .doc(pageID)
        .set(data.data)
        .then(function() {
          console.log('Document successfully written! ID: ', pageID);
          //==Added functions for certain page types.
          if (['text', 'object', 'person', 'event', 'place',
            'info', 'hours', 'admission']
            .includes(data.type))
          {
            Click.backTargetHandler('page_form');
          } else if (data.type === 'question') {
            QuizEditor.addPreview(data.data, pageID);
          } else {
            console.log('PageType not defined!');
          }
        })
        .catch(function(error) {
          console.error('Error writing document: ', error);
        });
    };

  //============================================================================
  /**
   * Function to validate a JSON object against a JSONSchema.
   * @memberof Data
   * @param {Object} data - An {@link Glossary.datatype#object|object} containing the page data document.
   * @param {string} pageID - An ID {@link Glossary.datatype#string|string} of an existing page.
   * @see {@link https://github.com/epoberezkin/ajv|GitHub} -
   *      The Ajv Documentation.
   */
  let validateJSON =
    async function(data, pageID) {
      console.log('validate JSON');
      console.log(data.type);
      let promises = [];
      //==Get the schema file {Not necessary for draft 07!}.
      promises
        .push(Data.getFile('util/dependency/json/',
          'json-schema-draft-06', 'json'));
      //==Get the schema file according to the page type.
      promises
        .push(Data.getFile('forms/data/', data.type + '.schema', 'json'));
      let returnValue = null;
      //==Wait for files.
      await Promise.all(promises).then(function() {
        //--initialize Ajv JSON validator.
        let ajv = new Ajv();
        ajv.addMetaSchema(arguments[0][0]);

        //--Validate received data
        let valid = ajv.validate(arguments[0][1], data.data);

        //--Init 'returnValue'.
        let commitValue = null;

        if (!valid) {
          console.log('JSON Error: ', ajv.errors);
          commitValue = ajv.errors;
          returnValue = false;
          if (data.type === 'appmeta') {
            alert(Lang.getString('error_entry'));
          } else {
            alert(Lang.getString('alertErrorSubmission'));
          }
        } else {
          console.log('Good! JSON is valid.');
          commitValue = data;
          returnValue = true;
          if (!pageID) {
            //--Commit valid data to database.
            commitPageData(commitValue);
          } else {
            updatePageData(commitValue, pageID);
          }
        }
        try {
          //--Query the form output <PRE> element.
          let targetElement = document.querySelector('#formOutput');
          //--Prepare JSON for displaying pourpuse.
          targetElement.innerHTML = syntaxHighlight(commitValue);
        } catch (e) {
          console.log('Error:', e);
        }
      }.bind(returnValue));
      return returnValue;
    };
  //============================================================================

  //============================================================================
  /**
   * Function to remove text from a HTMLElement.
   *
   * @see {@link https://stackoverflow.com/questions/32247836/remove-all-text-content-from-html-div-but-keep-html-tags-and-structure|StackOverflow} -
   *      Remove text from DOM.
   *
   * @param {HTMLElement} element - A {@link Glossary.datatype#HTMLElement|HTMLElement}.
   *
   * @memberof Data
   * @private
   */
  let removeAllText =
    function(element) {
      //==Loop through all the nodes of the element
      var nodes = element.childNodes;

      for(var i = 0; i < nodes.length; i++) {

        var node = nodes[i];

        //==If it's a text node, remove it
        if(node.nodeType == Node.TEXT_NODE) {

          node.parentNode.removeChild(node);

          //--Update our incrementor since a node was removed from childNodes.
          i--;

        } else
        //==If it's an element, repeat this process recursively.
        if(node.nodeType == Node.ELEMENT_NODE) {
          removeAllText(node);
        }
      }
    };
  //============================================================================

  //==Make public functions available on the namespace Object.
  this.commitForm = commitForm;
  this.commitPageData = commitPageData;
  this.deleteApp = deleteApp;
  this.deletePage = deletePage;
  this.getFile = getFile;
  this.getPageData = getPageData;
  this.getPageTypeData = getPageTypeData;
  this.hideApp = hideApp;
  this.publishApp = publishApp;
  this.renderItemData = renderItemData;
  this.showAppStats = showAppStats;
  this.syntaxHighlight = syntaxHighlight;
  this.validateJSON = validateJSON;
  //============================================================================
}).apply(Data);
//==============================================================================
//==EOF=========================================================================
