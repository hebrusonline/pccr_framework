//==============================================================================
/**
 * @file This File contains definitions of the Dash namespace.
 *
 * <pre>
 *
*==Method List:================================================================= <br>
* | Name           | Description                                                          |
* ---------------- | ---------------------------------------------------------            |
* | [closeStats]{@link Dash.closeStats}     | Function to close the stat overlay.                                  |
* | [previewApp]{@link Dash.previewApp}     | Function to show the app in a new window, sized for preview purposes. |
* | [showAppList]{@link Dash.showAppList}    | Function to show the app list, per default within the dashboard.     |
* </pre>
 * @author       Hebrus
 *
 * @see {@link Dash} - The Dash namespace.
 */
//==============================================================================


window.customElements.define('dash-item', DashItem);

/**
 * The Dash namespace.
 * @namespace
 */
var Dash = {};

(function(){
  //============================================================================
  /**
   * Function to close the stat overlay.
   *
   * @memberof Dash
   */
  let closeStats =
    function() {
      document.querySelector('#dash__stats').classList.add('hidden');
    };

  //============================================================================
  /**
   * Functon to show the app in a new window, sized for preview purposes.
   *
   * @param {string} appID - The id of the app to preview.
   *
   * @memberof Dash
   */
  let previewApp =
    function(appID) {
      localStorage.setItem('appSenderID', appID);
      localStorage.setItem('consumerID', 'creator');
      localStorage.setItem('creatorID', __USER.id);

      newwindow = window.open(
        '../app-client/home.html',
        'Preview',
        'height=640,width=360'
      );

      if (window.focus) {
        newwindow.focus();
      }
    };

  //============================================================================
  /**
   * Function to show the app list, per default within the dashboard.
   *
   * @param {HTMLObject} target - The target list container.
   * @param {boolean} [change=false] - The element's attributes.
   *
   * @memberof Dash
   */
  let showAppList =
    async function(
      target = document.querySelector('#dash-box').querySelector('#dash-list'),
      change = false)
    {
      let dashList = target;
      dashList.innerHTML = '';

      //==Get the necessary data.
      let appData = await Data.getPageTypeData('app');
      console.log(appData);

      //==Loop through the apps.
      appData.forEach(async function(doc) {
        let data = doc.data();
        data.id = doc.id;
        //==Get the appmeta page.
        let appmeta = await Data.getPageData(data['appmeta'], 'appmeta');

        let dateTime = new Date(appmeta._document.version.timestamp.seconds*1000).toLocaleDateString();
        //==Create the list item.
        let listItem = document.createElement('dash-item');
        listItem.initElement(appmeta.data(), data, change, dateTime);
        dashList.appendChild(listItem);
      });
    };

  //============================================================================

  //==Make functions available on the namespace object.=========================
  this.showAppList = showAppList;
  this.previewApp = previewApp;
  this.closeStats = closeStats;
  //============================================================================
}).apply(Dash);
//==EOF=========================================================================
//==============================================================================
