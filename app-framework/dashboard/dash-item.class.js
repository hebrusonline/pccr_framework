//CLASS
/**
 * @classdesc
 * Class representing a DashItem.                                           <br>
 *
 * @extends HTMLElement
 *
 * @memberof Dash
 */
class DashItem extends HTMLElement {
  /**
   *Empty constructor.
   * @constructor
   */
  constructor() {
    const self = super();
  }

  /**
   * Method to initialize the element by setting the correct data and template.
   *
   * @param {Object} metaData - The app meta page.
   * @param {Object} appData - The app data.
   * @param {boolean} change - Indicator if list is for changing an app.
   */
  initElement(metaData, appData, change, dateTime) {
    this.app = appData;
    this.data = metaData;
    this.dateTime = dateTime;
    this.change = change;

    this.classList.add('dash--item');
    this.setTemplate();
  }

  /**
   * Method to get the dash-item template and set the click listeners.
   */
  setTemplate() {
    let promises = [];
    //==Create promise for template html file.
    promises
      .push(Data.getFile('dashboard/', 'dash-item.template', 'html'));
    //==Resolve promises made above.
    Promise.all(promises).then(function() {
      //==Add template structure to this.
      this.innerHTML = arguments[0][0][0].innerHTML;

      //==Enable button click listener.=========================================
      this.querySelector('.btn__enable').onclick = function(e) {
        Data.publishApp(this.app);
      }.bind(this);

      this.querySelector('.btn__enable').innerHTML = Lang.getString('enable');

      //==Disable button click listener.========================================
      this.querySelector('.btn__disable').onclick = function(e) {
        Data.hideApp(this.app);
      }.bind(this);

      this.querySelector('.btn__disable').innerHTML = Lang.getString('disable');

      //==Preview button click listener.========================================
      this.querySelector('.btn__preview').onclick = function(e) {
        Dash.previewApp(this.app.published);
      }.bind(this);

      this.querySelector('.btn__preview').innerHTML = Lang.getString('preview');

      //==Stats button click listener.==========================================
      this.querySelector('.dash-item__context').onclick = function() {
        Data.showAppStats(this.app);
      }.bind(this);

      //==Initialize the data.
      this.initData();
      //==Bind this context.
    }.bind(this));
  }

  /**
   * Method to initialize the item data.
   */
  initData() {
    //==Set the appropriate disabled/enabled button config.
    if (this.app.published) {
      this.querySelector('.btn__disable').disabled = false;
      this.querySelector('.btn__preview').disabled = false;
      this.querySelector('.btn__enable').disabled = true;
    }

    //==Get and set the dash item fields.
    let logo = this.querySelector('.dash-item__logo img');
    let caption = this.querySelector('.dash-item__caption');
    let audience = this.querySelector('.dash-item__audience');
    let type = this.querySelector('.dash-item__type');
    let pages = this.querySelector('.dash-item__pages');
    let date = this.querySelector('.dash-item__date');

    logo.src = 'util/assets/' + this.data.language + '.png';

    caption.innerHTML = this.data.caption;

    audience.innerHTML = Lang.getString(this.data.audience);

    type.innerHTML = Lang.getString(this.data.content);

    pages.innerHTML = Object.keys(this.app.pages).length;

    date.innerHTML = this.dateTime;

    //==Prepare the list in case of change item list.
    if (this.change) {
      //--Replace regular buttons with 'CHANGE' button.
      let buttons = this.querySelector('.buttons');
      //--Create change button.
      let changeButton = document.createElement('button');
      changeButton.classList.add('button', 'btn');
      changeButton.innerHTML = Lang.getString('change');
      buttons.innerHTML = '';

      //--Set the click listener.
      changeButton.onclick = function() {
        AppEditor.changeApp(this.app, this.data.content);
      }.bind(this);
      buttons.appendChild(changeButton);

      //--Create delete button.
      let deleteButton = document.createElement('button');
      deleteButton.classList.add('button', 'btn', 'btn-dash-delete');
      deleteButton.innerHTML = Lang.getString('delete');

      if (this.app.published) {
        deleteButton.disabled = true;
      }

      //--Set the click listener.
      deleteButton.onclick = function() {
        console.log('delete');

        let dialog = document.querySelector(
          '#info-page-box #formOutput-container .delete-dialog'
        );
        let localDialog = dialog.cloneNode(true);

        //--Show dialog.
        localDialog.classList.remove('hidden');
        document.querySelector('#app-change-box').appendChild(localDialog);
        //==Leave the deletion process.
        localDialog.querySelector('#dlg_btn_cancel').innerHTML =
          Lang.getString('btnCancelDeleteApp');
        localDialog.querySelector('#dlg_btn_cancel').onclick =  function(){
          localDialog.classList.add('hidden');
        };

        //==Trigger actual app deleteion.
        localDialog.querySelector('#dlg_btn_confirm').innerHTML =
          Lang.getString('btnConfirmDeleteApp');
        localDialog.querySelector('#dlg_btn_confirm').onclick =  function(){
          //--Delete the app.
          Data.deleteApp(this.app.id);

          localDialog.classList.add('hidden');
          //--Navigate back.
          Click.backTargetHandler(__BACK_TARGET);
        }.bind(this);
      }.bind(this);
      buttons.appendChild(deleteButton);

      //--Reset the statistics.
      let statistics = this.querySelector('.dash-item__context');
      statistics.classList.add('hidden');
    }
  }
}
//==============================================================================
//==EOF=========================================================================
