//==============================================================================
/**
* @file
* This file defines functions necessary for the consumer application's analytics. <br>
* For the purpose of evaluation each unique visit within a certain timeframe
* logs every single page visited. <br>
This Process does not require continuous internet connection.
* <pre>
*
*==Method List:================================================================= <br>
* | Name           | Description                                                          |
* ---------------- | ---------------------------------------------------------            |
* | [initialize]{@link ConsumerApp.Analytics.initialize}     | Function to initialize the analytics page tracker.                   |
* | [logPage]{@link ConsumerApp.Analytics.logPage}        | Function to log a page visit.                                        |
* | [upload]{@link ConsumerApp.Analytics.upload}         | Function to upload past visits to database.                          |
* </pre>
* @author       Hebrus
*
* @see {@link ConsumerApp.Analytics} - The ConsumerApp.Analytics namespace.
*/
//==============================================================================

/**
 * The ConsumerApp.Analytics namespace.
 * @namespace ConsumerApp.Analytics
 */
let Analytics = {};

(function(){
  //============================================================================
  /**
   * Function to initialize the analytics page tracker.                     <br>
   * Check if app and consumer are already identified correctly.
   *
   * @param {string} creatorID - The ID of the creator current app.
   * @param {string} appID     - The ID of the current app.
   *
   * @memberof ConsumerApp.Analytics
   */
  let initialize =
    async function(creatorID, appID){
      //==Check if consumer is already registered.
      if(window.localStorage.getItem('consumerID') === null){
        console.log('new consumer');
        let database = firebase.firestore();
        let newConsumer = {
          firstVisit: new Date().getTime()
        };
        try {
          //--Create new consumer.
          database
            .collection(creatorID)
            .doc('analytics')
            .collection('consumers')
            .add(newConsumer)
            .then(function(docRef){
              console.log(docRef.id);
              window.localStorage.setItem('consumerID', docRef.id);
              window.localStorage.setItem('creatorID', creatorID);
              window.localStorage.setItem('appID', appID);
            });

        } catch (error) {
          console.log('Error getting documents: ', error);
        }
      }else
      //==Check existing consumer.
      if(window.localStorage.getItem('consumerID')
      && window.localStorage.getItem('creatorID')){
        console.log('returning consumer');
        //--Check for new app call.
        if(window.localStorage.getItem('appID') != appID){
          console.log('new app visit');
          //-Get past visits.
          let pastVisits = JSON.parse(window.localStorage.getItem('pastVisits'));
          if(pastVisits === null){
            //Create past visit array.
            pastVisits = [];
          }
          //-Add current visits to past visits.
          pastVisits.push(JSON.parse(window.localStorage.getItem('currentVisit')));
          window.localStorage.setItem('currentVisit', null);
          window.localStorage.setItem('pastVisits', JSON.stringify(pastVisits));
          //-Upload current data.
          upload();
          //-Set IDs of new app.
          window.localStorage.setItem('appID',appID);
          window.localStorage.setItem('creatorID',creatorID);
        }else{
          //-Upload current data of existing app.
          upload();
        }
      }else{
        console.log('Should never go here!');
      }
    };

  //============================================================================
  /**
   * Function to log a page visit.                                          <br>
   * Check if time limit is still valid and either append current visit or create new session.
   *
   * @param {string} type   - The type of the visited page.
   * @param {string} id     - The page ID of the visited page.
   *
   * @memberof ConsumerApp.Analytics
   */
  let logPage =
  function(type, id){
    //==Get the current visit.
    let currentVisit = JSON.parse(window.localStorage.getItem('currentVisit'));
    if(currentVisit === null){
      //--Create new visit.
      console.log('no current visit');
      currentVisit = [{
        pageId: id,
        pageIndex: currentPage,
        pageType: type,
        time: new Date().getTime()
      }];
    }else{
      //--Add page to current visit.
      console.log('current visit');
      console.log(currentVisit[currentVisit.length-1].time, new Date().getTime());
      //-Check if session has expired (half an hour).
      if(currentVisit[currentVisit.length-1].time < new Date().getTime()-1800000){
        console.log('old current visit');
        //Add current visits to past visits.
        let pastVisits = JSON.parse(window.localStorage.getItem('pastVisits'));
        if(pastVisits === null){
          //Create past visits array.
          pastVisits = [];
        }
        pastVisits.push(currentVisit);
        currentVisit = [{
          pageId: id,
          pageIndex: currentPage,
          pageType: type,
          time: new Date().getTime()
        }];
        //Store past visits.
        window.localStorage.setItem('pastVisits', JSON.stringify(pastVisits));
      }else{
        console.log('actual current visit');
        //--Add current visit to current visits array.
        currentVisit.push(
          {
            pageId: id,
            pageIndex: currentPage,
            pageType: type,
            time: new Date().getTime()
          }
        );
      }
    }
    //Store current visits.
    window.localStorage.setItem('currentVisit', JSON.stringify(currentVisit));
  };

  //============================================================================
  /**
   * Function to upload past visits to database.                            <br>
   *
   * @memberof ConsumerApp.Analytics
   */
  let upload =
  async function(){
    //==Check for past past visits.
    let pastVisits = JSON.parse(window.localStorage.getItem('pastVisits'));
    if(pastVisits != null){
      //--Add to database.
      let database = firebase.firestore();
      try {
        //-For each element in past visits array, add it to database.
        for(visit in pastVisits){
          await database
            .collection(window.localStorage.getItem('creatorID'))
            .doc('analytics')
            .collection('visits')
            .add(
              {
                appID: window.localStorage.getItem('appID'),
                appOriginID: window.localStorage.getItem('appOriginID'),
                creatorID: window.localStorage.getItem('creatorID'),
                consumerID: window.localStorage.getItem('consumerID'),
                visit: pastVisits[visit]
              }
            );
        }
        //-Update consumer's last visit & number of visits.
        let numberOfVisits = pastVisits.length;
        let lastVisit = pastVisits[pastVisits.length-1][0].time;
        if(window.localStorage.getItem('numberOfVisits') != null){
          numberOfVisits += parseInt(window.localStorage.getItem('numberOfVisits'));
        }
        window.localStorage.setItem('numberOfVisits', numberOfVisits);
        database
          .collection(window.localStorage.getItem('creatorID'))
          .doc('analytics')
          .collection('consumers')
          .doc(window.localStorage.getItem('consumerID'))
          .set({
            'numberOfVisits' : numberOfVisits,
            'lastVisit' : lastVisit
          }, { merge: true }).then(
            function(){console.log('HERE');}
          );
        //-Reset past visits.
        window.localStorage.setItem('pastVisits', null);
      } catch (error) {
        console.log('Error uploading documents: ', error);
      }
    }
  };

  //============================================================================

  //==Add functions to the namespace object scope.
  this.initialize = initialize;
  this.logPage = logPage;
  //============================================================================

}).apply(Analytics);
