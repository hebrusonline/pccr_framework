//==============================================================================
/**
 * @file This file contains preview-phone utility methods.
 *
 * <pre>
 *
*==Method List:================================================================================================== <br>
* | Name                   | Description                                                                          |
* ----------------         | ------------------------------------------------------------------------------------ |
* | [findActivePreviewPhone]{@link Phone.findActivePreviewPhone} | Function to find the visible preview phone element in the DOM.                       |
* | [previewPhoneLayout]{@link Phone.previewPhoneLayout}     | Function to check and preview multiple layouts of the chosen PageType if applicable. |
* | [renderPreviewPhone]{@link Phone.renderPreviewPhone}     | Function to render the input data to a preview phone.                                |
* | [setPhoneAttributes]{@link Phone.setPhoneAttributes}     | Function to set the attributes for the preview phone.                                |
* </pre>
 * @author       Hebrus
 *
 * @see {@link Phone} - The Phone namespace.
 */
//==============================================================================

//==Register custom preview-phone element.
window.customElements.define('preview-phone', PreviewPhone);

/**
 * The Phone namespace.
 * @namespace
 */
var Phone = {};

//==Namespacing construct.
(function() {
  //============================================================================
  /**
   * Function to find the visible preview phone element in the DOM.
   *
   * @return {HTMLElement} The visible preview phone {@link Glossary.datatype#HTMLElement|HTMLElement}.
   *
   * @memberof Phone
   */
  let findActivePreviewPhone =
    function() {
      let parent = {};
      //==Get parent elements [either in form or editor view].
      let infoBox = document.querySelector('#info-page-box');
      let appEditor = document.querySelector('#app-editor-box');
      //==Find the visible one.
      if(infoBox.classList.contains('show')){
        parent = infoBox.querySelector('#phone-container #preview-phone');
      }else if(appEditor.classList.contains('show')){
        parent = appEditor.querySelector('#phone-container #preview-phone');
      }else{
        console.log('No preview phone found!');
      }

      //==Return active preview phone.
      return parent;
    };

  //============================================================================
  /**
   * Function to check and preview multiple layouts of the chosen PageType if applicable.
   *
   * @param {string} type - A {@link Glossary.PageType|Page Type} String.
   *
   * @memberof Phone
   */
  let previewPhoneLayout =
    function(type) {
      //==Check allowd page types.
      if (
        ['text', 'object', 'person', 'event', 'place',
          'info', 'hours', 'admission'].includes(type)
      ) {
        //==Get the JSOONSchema file.
        let promises = [];
        promises
          .push(Data
            .getFile('forms/data/', type + '.schema', 'json'));
        Promise.all(promises).then(function() {
          //==Get layouts enum form Schema.
          let jsonSchema = arguments[0][0];
          let layouts = jsonSchema.properties.layout.enum;

          //==Create container element.
          let container = document.createElement('div');
          container.id = 'layoutContainer';

          //==Check length of layouts.
          if (layouts.length > 1) {
            //--Loop layouts to render each.
            for (let key in layouts) {
              //-File name string (withiout HTML extension).
              let layout = type + '/' + layouts[key] + '.layout';
              //-Create parent element for single layout preview.
              let phone = document.createElement('div');
              phone.classList.add('small-screen');
              phone.classList.add('screen');
              phone.type = layouts[key];

              setPhoneAttributes(
                phone,
                '',
                type,
                key);
              //-Create preview-phone element.
              let previewPhone = document.createElement('preview-phone');
              //-Init empty element.
              previewPhone.initElement({}, layout, phone);
              //-Add layout preview to container.
              container.appendChild(phone);
            }
            //--Reset target container.
            document.querySelector('#layout-container').innerHTML = '';
            //--Add layouts to target container.
            document.querySelector('#layout-container').appendChild(container);
            //--Show the layout container.
            UI.showElement('#layout-container');
            //--Add to back button.
            Click.setBackTarget('choose_layout');
          } else {
            //--Create the page form immediately.
            UI.createPageForm(type + '/basic.layout');
          }
        });
      } else {
        console.log('Unhandled type:', type);
      }
    };

  //============================================================================
  /**
   * Function to render the input data to a preview phone.
   * @memberof Phone
   * @param {Object} input - The input {@link Glossary.datatype#object|object}.
   */
  let renderPreviewPhone =
    function(input) {
      //==Input is string IF an input error occured.
      if (typeof(input) === 'string') {
        //--Put error message into preview phone.
        document.querySelector('#preview-phone').innerHTML = input;
        //==IF no error occures.
      } else {
        //==Create 'preview-phone' element.
        let newPhone = document.createElement('preview-phone');

        //==Layout file name string (withiout HTML file extension).
        let layout = input.type + '/' + input.data.layout;

        //==Get parent phone element.
        let parent = findActivePreviewPhone();

        //==Set the attributes of the preview phone parent.
        setPhoneAttributes(
          parent,
          input.data.id,
          input.type,
          input.data.layout);

        //==Render the phone preview to its parent with the input data.
        newPhone.initElement(input.data, layout.split('.')[0], parent);
      }
    };

  //============================================================================
  /**
   * Function to set the attributes for the preview phone.
   *
   * @param {PreviewPhone} phone - The preview phone element.
   * @param {string} pageID - The page ID.
   * @param {string} type - A {@link Glossary.PageType|Page Type} string.
   * @param {string} layout - The page layout.
   *
   * @memberof Phone
   */
  let setPhoneAttributes =
    function(phone, pageID, type, layout) {
      phone.page_id = pageID;
      phone.setAttribute('type', type);
      phone.type = type;
      phone.setAttribute('layout', layout);
    };
  //============================================================================

  //==Make methods available on the namespace Object.
  this.findActivePreviewPhone = findActivePreviewPhone;
  this.previewPhoneLayout = previewPhoneLayout;
  this.renderPreviewPhone = renderPreviewPhone;
  this.setPhoneAttributes = setPhoneAttributes;
  //============================================================================
}).apply(Phone);
//==============================================================================
//==EOF=========================================================================
