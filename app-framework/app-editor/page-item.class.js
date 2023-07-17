//==============================================================================
/**
 * @file This File contains definitions concerned with the PageItem class.
 *
 * @author       Hebrus
 *
 * @see {@link AppEditor.PageItem} - The AppEditor namespace.
 */
//==============================================================================
/**
 * Class representing an PageItem element.                                  <br>
 * @extends HTMLElement
 *
 * @memberof AppEditor
 */
class PageItem extends HTMLElement {
  /**
   *Empty constructor.
   * @constructor
   */
  constructor() {
    const self = super();
  }

  /**
   * Initialize element by setting its preview phone and base type.
   *
   * @param {HTMLElement} phone - The preview phone for the list item.
   * @param {string} baseType - The type of the page.
   */
  initElement(phone, baseType) {
    this.phone = phone;
    this.baseType = baseType;

    this.classList.add('page--item');
    this.setTemplate();
  }

  /**
   * Initialize the page item with the given data.                          <br>
   * In the case of a cube page, get the base page data first.
   *
   * @param {Object} pageData - The data of the page to be added.
   */
  async initDataElement(pageData, pageNumber) {
    console.log(pageData);
    this.data = pageData;
    this.number = pageNumber;
    this.data.cube = false;

    //==In the case of a cube page, get the base page data first.
    if(pageData.type === 'cube'){
      let cubePageData = await Data.getPageData(pageData.id, pageData.type);

      cubePageData = cubePageData.data();

      this.data = cubePageData.basePage;
      this.data.cubeID = pageData.id;
    }
    //==Set the base type.
    this.baseType = this.data.type;

    this.classList.add('page--item');
    this.setTemplate();
  }

  /**
   * Set the element's template.
   */
  setTemplate() {
    let promises = [];
    //==Create promise for template html file.
    promises
      .push(Data.getFile('app-editor/', 'page-item.template', 'html'));
    //==Resolve promises made above.
    Promise.all(promises).then(function() {
      //==Add template structure to this.
      this.innerHTML = arguments[0][0][0].innerHTML;

      this.querySelector('.page-item__close').delete = function() {
        console.log('delete');
        // Close button>content box>page-item>item-list
        this.parentElement.parentElement.parentElement
          .removeChild(this.parentElement.parentElement);
        //Init drag list --> cleanup
        Drag.updateAppPageList();
      };

      //==Show number input in case of "explore"
      if(AppEditor.content === 'explore'){
        this.querySelector('input').value = this.number;
        this.querySelector('input').classList.remove('hidden');
      }
      if(this.data){
        //==If data is available, initialize the element.
        this.initData();
      }else{
        this.initPhoneData();
      }
      //==Bind this context.
    }.bind(this));
  }

  /**
   * Build the page item element from the provided data.
   */
  async initData() {
    let dataError = false;
    console.log('init item from data');
    this.page_id = this.data.id;
    this.type = this.data.type;

    //==Get the item elements.
    let logo = this.querySelector('.page-item__logo');
    let text = this.querySelector('.page-item__text');
    let pageData = {};

    if (
      ['text', 'object', 'person', 'event', 'place', 'room', 'quiz']
        .includes(this.type))
    {
      logo.innerHTML = '';
      this.page_id = this.data.id;
      this.type = this.data.type;

      //==Get the page's data.
      pageData = await Data.getPageData(this.page_id, this.type);
      pageData = pageData.data();
      console.log(pageData);

      //==Set item values.
      if (pageData) {
        this.layout = pageData.layout;
        //--Set page icon.
        if (this.data.cubeID) {
          logo.innerHTML =
                `
                <i id="phone-header-icon" class="fas fa-cubes"></i>
                `;

        }else{
          console.log(this.data.type);
          let logo_string = FA[this.data.type].mod + ' ' + FA[this.data.type].id;
          logo.innerHTML =
                `
                <i id="phone-header-icon" class="${logo_string}"></i>
                `;
        }
        //--Set item text.
        text.innerHTML = pageData.name;
      }
    }else{
      console.log('Unhandled case!');
    }

    //==Create preview phone.
    if (pageData) {
      let phoneContainer = this.querySelector('.listscreen');
      let newPhone = document.createElement('div');
      phoneContainer.appendChild(newPhone);

      newPhone.id = 'preview-phone';
      newPhone.classList.add('screen', 'small-screen');
      newPhone.innerHTML = '';

      let createPhone = document.createElement('preview-phone');

      Phone.setPhoneAttributes(
        newPhone,
        this.page_id,
        this.type,
        this.layout);

      if (this.data.cubeID) {
        this.page_id = this.data.cubeID;
        this.type = 'cube';
      }
      console.log(pageData);
      createPhone.initElement(pageData, this.baseType+'/'+this.layout, newPhone);
    }else{
      //==Remove item from List because of missing data.
      this.remove();
    }
  }

  /**
   * Add the provided elements to the page item.
   */
  initPhoneData() {

    this.page_id = this.phone.page_id;
    this.type = this.phone.getAttribute('type');

    let logo = this.querySelector('.page-item__logo');
    let text = this.querySelector('.page-item__text');

    if (
      ['text', 'object', 'person', 'event', 'place', 'room', 'quiz']
        .includes(this.type))
    {
      //==Set item values.
      logo.innerHTML = '';
      logo.appendChild(
        this.phone.querySelector('#phone-header-icon').cloneNode(true)
      );
      text.innerHTML = this.phone.querySelector('#name').innerHTML;
    }else if(this.phone.getAttribute('type') === 'cube'){
      //==Handle cube.
      this.phone.setAttribute('type', this.baseType);
      text.innerHTML = this.phone.querySelector('#name').innerHTML;
      logo.innerHTML =
        `
        <i id="phone-header-icon" class="fas fa-cubes"></i>
        `;
    }
    //==Set preview phone.
    this.querySelector('.listscreen').innerHTML = '';
    this.querySelector('.listscreen').appendChild(this.phone.cloneNode(true));
  }
}
//==============================================================================
//==EOF=========================================================================
