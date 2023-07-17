//==============================================================================
/**
 * @file This File contains definitions concerned with the Cards namespace and the PageCard class.
 * <pre>
 *
 *==Method List:================================================================= <br>
 * | Name                     | Description                                                   |
 * -------------------------- | ---------------------------------------------------------     |
 * | [assambleDropdown]{@link Cards.assambleDropdown}         | Generate a dropdown containing all elements of a certain type.|
 * | [assambleGrid]{@link Cards.assambleGrid}             | Generate a grid containing all elements of a certain type.    |
 * | [click_createPageForm]{@link Cards.click_createPageForm}     | Create a form to input page information.                      |
 * | [click_showPageOptions]{@link Cards.click_showPageOptions}    | Show options and enable CRUD operations.                      |
 * </pre>
 * @author       Hebrus
 *
 * @see {@link Cards} - The Cards namespace.
 */

/**
 * The Cards namespace.
 * @namespace
 */
var Cards = {};

//==============================================================================
//CLASS
/**
 * @classdesc
 * Class representing a PageCard.                                           <br>
 *
 * @extends HTMLElement
 *
 * @memberof Cards
 */

class PageCard extends HTMLElement {
  /**
   *Empty constructor.
   * @constructor
   */
  constructor() {
    super();
  }
  //============================================================================
  //==SETTER & GETTER===========================================================
  /**
   * Setter for the attributes.
   * @param {object} attributes - The attributes object.
   */
  set attributes(attributes) {
    this._attributes = attributes;
  }
  /**
   * Getter for the attributes.
   * @type {object}
   */
  get attributes() {
    return this._attributes;
  }
  /**
   * Setter for the template.
   * @param {NodeList} templates - The template NodeList.
   */
  set templates(templates) {
    this._templates = templates;
  }
  /**
   * Getter for the template NodeList.
   * @type {NodeList}
   */
  get templates() {
    return this._templates;
  }

  //============================================================================
  /**
   * This method sets the element's attributes and
   * sets the element's template to initialize the element.
   *
   * @param {object} attributes - The element's attributes.
   */
  initElement(attributes) {
    //==Set the attributes.
    this.attributes = attributes;
    //==Set the needed template.
    this.setTemplate();
  }

  //============================================================================
  /**
   * Setup the template.                                                    <br>
   * Get the necessary template file & then insert attributes.
   */
  setTemplate() {
    let promises = [];
    //==Create promise for template html file.
    promises.push(Data.getFile('cards/templates/', this.tagName, 'html'));
    //==Resolve promises.
    Promise.all(promises).then(function() {
      //==Set template elements into this.
      this.appendChild(arguments[0][0][0]);
      //==Initilaize attributes by matching them to template elements.
      this.initAttributes();
      //==Bind this context.
    }.bind(this));
  }

  //============================================================================
  /**
   * Initialize the attributes after template is set.
   */
  initAttributes() {
    this.lableStrings =
      Lang.getString(this.attributes.target, this.tagName);
    //==Loop through the attributes object.
    for (let key in this.attributes) {
      //==Get the matching element.
      let el = this.querySelector('.pageSelect-' + key);
      //==Special treatment for the image attribute.
      if (key === 'image') {
        //==Setup font awesome class.
        el.classList.add(this.attributes[key]['fa-class']);
        el.classList.add(this.attributes[key]['fa-add']);
        //==Special treatment for the target attribute.
      } else if (key === 'target') {
        //==Set the target attribute.
        el.parentNode.setAttribute('target', this.attributes[key]);
        //==SET CASE HERE if other special treatment is needed!
      } else {
        //==Default behaviour.
        el.innerHTML = this.lableStrings[key];
      }
    }
    this.querySelector('.more-button').innerHTML =
      langJSON.util.button_text.more;
    this.querySelector('.create-button').innerHTML =
      langJSON.util.button_text.add;
  }
}
//==============================================================================

//==CARD utilities.
//==============================================================================
//===Method List:
// - assambleDropdown     - Generate a dropdown containing all elements of a certain type
// - assambleGrid         - Generate a grid containing all elements of a certain type.
// - click_createPageForm - Create a form to input page information.
// - click_showPageOptions- Show options and enable CRUD operations.
//==============================================================================
//==Namespacing construct.
(function() {
  /**
   * Create a form to input page information.                               <br>
   * Display the form as well as the output pane.
   *
   * @param {HTMLElement} element -
   * The element that triggered the function.
   * Its parent must holds the target information.
   *
   * @memberof Cards
   */
  let click_createPageForm =
    function(element) {
      //==Show layout options or create form.
      Phone.previewPhoneLayout(element.parentNode.getAttribute('target'));

      //==Hide phone and hide buttons.
      UI.hideElement('#info-page-box #formOutput-container');
      UI.hideElement('#info-page-box #formOutput-container .footer-buttons');
    };

  //============================================================================
  /**
 * Show the neccessary elements.                                             <br>
 * Enable CRUD operations (Show, Change, Delete).

 * @param {HTMLElement} element -
 * The element that triggered the function.
 * Its parent must hold the target information.
 *
 * @memberof Cards
 */
  let click_showPageOptions =
    function(element) {
      //==Get the documentation content box.
      let instructionContent = document.querySelector(
        '#info-page-box #__string-instructionContent'
      );

      //Put the chosen page type into the box.
      instructionContent.innerHTML = langJSON
        .cards[element.parentNode.getAttribute('target')]
        .documentation;

      //==Get control button elements.
      let readItemButton = document.querySelector(
        '#info-page-box #dropdownButtonRead'
      );
      let showGridButton = document.querySelector(
        '#info-page-box #dropdownButtonGrid'
      );
      let updateItemButton = document.querySelector(
        '#info-page-box #dropdownButtonUpdate'
      );
      let deleteItemButton = document.querySelector(
        '#info-page-box #dropdownButtonDelete'
      );

      //==Add button click listeners.
      //==READ==================================================================
      readItemButton.onclick = function() {
        let dropdown = document.querySelector(' #info-page-box #pageDropdown');

        //==Show item content in preview phone.
        Data.renderItemData(
          dropdown.options[dropdown.selectedIndex].value, dropdown.name
        );

        //==Show preview phone and button elements.
        UI.showElement('#info-page-box #formOutput-container .footer-buttons');
        UI.showElement('#info-page-box #formOutput-container');
      };

      //==UPDATE================================================================
      updateItemButton.onclick = function() {
        //==Get preview phone scren.
        let phone = document.querySelector(
          '#info-page-box #formOutput-container .screen'
        );

        //==Show the form & preview phone and hide the grid and buttons.
        UI.showElement('#info-page-box #form-container');
        UI.hideElement('#info-page-box #formOutput-container .footer-buttons');
        UI.hideElement('#info-page-box #grid-container');

        Click.setBackTarget('page_form');

        //==Put data in form and preview phone.
        Data.renderItemData(phone.page_id, phone.getAttribute('type'), true);
      };

      //==DELETE================================================================
      deleteItemButton.onclick = function() {
        let phone = document.querySelector(
          '#info-page-box #formOutput-container .screen'
        );
        let dialog = document.querySelector(
          '#info-page-box #formOutput-container .delete-dialog'
        );
        //--Show dialog.
        dialog.classList.remove('hidden');

        //==Leave the deletion process.
        dialog.querySelector('#dlg_btn_cancel').onclick =  function(){
          dialog.classList.add('hidden');
        };

        //==Trigger actual page deleteion.
        dialog.querySelector('#dlg_btn_confirm').onclick =  function(){
          Data.deletePage(phone.type, phone.page_id);
          //--Rest the phone.
          phone.innerHTML = '';
          //--Hide the dialog.
          dialog.classList.add('hidden');
          //--Navigate back.
          Click.backTargetHandler(__BACK_TARGET);
        };
      };

      //==SHOW GRID=============================================================
      showGridButton.onclick = function() {
        Click.navigateTo({'id':'form-grid'});
        UI.resetElementText('#info-page-box #formOutput-container .screen');
        UI.hideElement('#info-page-box #formOutput-container .footer-buttons');

        //--Build the grid.
        assambleGrid(element.parentNode.getAttribute('target'));
      };

      //==Get data and add corresponding dropdown items.
      assambleDropdown(element.parentNode.getAttribute('target'));

      //==Handle navigation.
      let target = {};
      target.id = 'page-interaction';
      Click.navigateTo(target);
    };

  //============================================================================
  /**
   * Function to generate a dropdown containing all elements of a certain type.<br>
   * Async because data for the dropdown needs to be acquired from the server.
   *
   * @async
   * @param {string} type - The desired type.
   * @memberof Cards
   * @private
   */
  let assambleDropdown =
    async function(type) {
      //==Get data.
      let pageData = await Data.getPageTypeData(type);
      //Get schema to access sortBy.
      let schema = await Data.getFile('forms/data/', type+'.schema', 'json');
      //==Create list.
      let list = UI.createItemList(pageData, schema.sortBy);
      //==Add list to dropdown.
      UI.createDropdown(list, type);
    };

  //============================================================================
  /**
   * Function to generate a grid containing all elements of a certain type. <br>
   * Async because data for the grid needs to be acquired from the server.
   *
   * @async
   * @param {string} type - The desired type.
   * @param {string} parent - The desired type.
   * @param {string} language - The desired language.
   * @memberof Cards
   */
  let assambleGrid =
    async function(
      type, parent = document.querySelector('#grid-container'), language)
    {
      //==Get data.
      let pageData = await Data.getPageTypeData(type);
      //Get schema to access sortBy.
      let schema = await Data.getFile('forms/data/', type+'.schema', 'json');
      //==Create grid.
      UI.createGridItems(pageData, type, schema.sortBy, parent, language);
    };

  //============================================================================
  /**
   * Loop through entries in
   * ./app-framework/cards/data/page-card.json and create corresponding cards.
   *
   * @param {string} category - The input string describing the page category ("basic" or "advanced").
   * @memberof Cards
   */
  let createPageCards =
    function(category) {
      //==Setup promise.
      let promises = [];
      promises.push(Data.getFile(
        'cards/data/', 'page-card-' + category, 'json')
      );
      //==Resolve promise.
      Promise.all(promises).then(function() {
        //==Get JSON schema.
        jsonSchema = arguments[0][0];
        document.querySelector('#select-choices').innerHTML = '';
        //==Loop throug entries.
        for (let key in jsonSchema) {
          //==Create page card for the entery.
          createCard(jsonSchema[key]);
        }
      });
    };

  //============================================================================
  /**
   * Create a page select card with desired properties.
   *
   * @param {object} properties - The properties object for the page card.
   * @memberof Cards
   * @private
   */
  let createCard =
    function(properties) {
      //==Create a page-card element.
      let newCard = document.createElement('page-card');
      //==Look for the page-card container.
      let container = document.querySelector('#select-choices');
      //==Initialize the card.
      newCard.initElement(properties);
      //==Add card to container.
      container.appendChild(newCard);
    };
  //============================================================================
  this.click_createPageForm = click_createPageForm;
  this.click_showPageOptions = click_showPageOptions;
  this.assambleGrid = assambleGrid;
  this.createPageCards = createPageCards;
  //============================================================================
}).apply(Cards);

//==Register the custom page-card element.
window.customElements.define('page-card', PageCard);
//==============================================================================
//==EOF=========================================================================
