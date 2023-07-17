//==============================================================================
/**
 * @file
 * This file contains functions concerend with the process of creating UI elements. <br>
 * The central elements are entry forms and the selection of pages. <br>
 * The custom elements for the entry fields are documented here
 * {@link Input|Input}.
 *
 * <pre>
 *
 *==Method List:================================================================================================================= <br>
 * | Name                  | Description                                                                                          |
 * ----------------        | ---------------------------------------------------------------------------------------------------- |
 * | [addArrayElementButton]{@link UI.addArrayElementButton} | Function to add a button to an array input to allow the addition of extra array elements.            |
 * | [addInput]{@link UI.addInput}              | Function to add input field to the specified form container.                                         |
 * | [createDropdown]{@link UI.createDropdown}        | Function to create dropdown from a list object.                                                      |
 * | [createForm]{@link UI.createForm}            | Function to create a form of certain type and layout within the parent element container.            |
 * | [createGridItems]{@link UI.createGridItems}       | Function to create a page selection grid from the data document object.                              |
 * | [createGridItem]{@link UI.createGridItem}        | Function to create a grid item screen from the document object.                                      |
 * | [createIconBox]{@link UI.createIconBox}         | Function to create an icon box containing an fontawesome icon for the page type.                     |
 * | [createItemList]{@link UI.createItemList}        | Function to create item list from data object with id & sortBy field.                                |
 * | [createPageForm]{@link UI.createPageForm}        | Function to create an entry form with a page type and display the layout in a preview phone element. |
 * | [scaleFont]{@link UI.scaleFont}             | Function to scale the font size of a text to fit the parent container.                               |
 * | [showRawPageData]{@link UI.showRawPageData}       | Function to render raw item data to the output container.                                            |
 * | [UI.String#format]{@link UI.String#format}      | Extend the String prototype to process format literals.                                              |
 * </pre>
 * @author       Hebrus
 *
 * @see {@link UI} - The UI namespace.
 */

//==============================================================================
//==Register custom input elements as a basis for creating entry forms.
window.customElements.define('string-input', StringInput);
window.customElements.define('date-input', DateInput);
window.customElements.define('time-input', TimeInput);
window.customElements.define('number-input', NumberInput);
window.customElements.define('text-input', TextInput);
window.customElements.define('boolean-input', BooleanInput);
window.customElements.define('file-input', FileInput);
window.customElements.define('location-input', LocationInput);

//==============================================================================
/**
 * The UI namespace.
 * @namespace
 */
var UI = {};

(function() {
  //============================================================================
  /**
   * Function to add a button to an array input
   * to allow the addition of extra array elements.
   *
   * @param {object} object - An {@link Glossary.datatype#object|object} containing the base array input field's schema info.
   * @param {HTMLElement} container - The array form container {@link Glossary.datatype#HTMLElement|HTMLElement}.
   *
   * @memberof UI
   * @private
   */
  let addArrayElementButton =
    function(object, container) {
      console.log(object, container);
      //==Create button element.
      let addButton = document.createElement('button');
      //--Add style class.
      addButton.classList.add('btn--add-field');
      //--Add label text to add button.
      addButton.innerHTML = Lang.getString('add');
      //--Add 'ADD' button to the end of the container.
      container.appendChild(addButton);

      //==Add click listener.
      addButton.onclick = function() {
        //--Add array input fields to array container.
        addInput(object, container);
        //--Get array member count (includes add button).
        let count = container.childElementCount;
        //--Add visual indicator to field header (disregard add button).
        container.childNodes[count - 1]
          .querySelector('.form-header').childNodes[1].innerHTML +=
            (' ' + (count - 1));

        //==Add counter marker to element
        //-(disregard add button & account for base zero count).
        container.childNodes[count - 1].setAttribute('__arrayID', (count - 2));
        container.childNodes[count - 1].setAttribute('name',
          '' + container.childNodes[count - 1]
            .getAttribute('name') + (count - 2));

        //==Add preview phone fields.
        //--Get first element as reference.
        let template = document.querySelector('#phone-container')
          .querySelector('.__array').childNodes[1];
        //--Clone reference node.
        let clone = template.cloneNode(true);
        //--Set ID wit added indicator
        //-(disregard add button & account for base zero).
        clone.id = template.id + (count - 2);

        //==Add new node to preview container.
        document.querySelector('#phone-container')
          .querySelector('.__array').appendChild(clone);
        //--Loop through & clear the input fields.
        let fields = clone.querySelectorAll('*[id]');
        for (let i = 0; i < fields.length; i++) {
          fields[i].id = fields[i].id + (count - 2);
          fields[i].innerHTML = '';
        }

        //==Move add button to the end of the container.
        let button = container.querySelector('.btn--add-field');
        container.appendChild(button);
      };
    };

  //============================================================================
  /**
   * Function to add input field to the specified form container. <br>
   * Option to initialize the input field with existing data.
   *
   * @param {object} property - An {@link Glossary.datatype#object|object} containing the schema information for an input field.
   * @param {HTMLElement} [container=The info #form-container element.] The form container {@link Glossary.datatype#HTMLElement|HTMLElement}.
   * @param {object} [data] - The data {@link Glossary.datatype#object|object} to initialize the input field with.
   *
   * @memberof UI
   * @private
   */
  let addInput =
    async function(
      property,
      container = document.querySelector('#info-page-box #form-container'),
      data = undefined)
    {
      //==Check possible string properties.=====================================
      if (property.type === 'string') {
        //--Image string.
        if (property.media === 'image') {
          let newFileInput = document.createElement('file-input');
          newFileInput.initElement(property, data);
          container.appendChild(newFileInput);
        } else
        //--Date string.
        if (property.PCCRformat === 'date') {
          let newDateInput = document.createElement('date-input');
          newDateInput.initElement(property, data);
          container.appendChild(newDateInput);
        } else
        //--Time string.
        if (property.format === 'time') {
          let newTimeInput = document.createElement('time-input');
          newTimeInput.initElement(property, data);
          container.appendChild(newTimeInput);
        } else
        //--Long string.
        if (property.minLength > 15) {
          let newTextInput = document.createElement('text-input');
          newTextInput.initElement(property, data);
          container.appendChild(newTextInput);
          //--Generic string.
        } else {
          let newStringInput = document.createElement('string-input');
          newStringInput.initElement(property, data);
          container.appendChild(newStringInput);
        }
      } else
      //==Check number property.================================================
      if (property.type === 'number') {
        let newNumberInput = document.createElement('number-input');
        newNumberInput.initElement(property, data);
        container.appendChild(newNumberInput);
      } else
      //==Check boolean property.===============================================
      if (property.type === 'boolean') {
        let newBooleanInput = document.createElement('boolean-input');
        newBooleanInput.initElement(property, data);
        container.appendChild(newBooleanInput);
      } else
      //==Handle object forms.==================================================
      if (property.type === 'object' && property.form) {
        //--Create generic object container=====================================
        let objectContainer = document.createElement('div');
        let containerHeader = document.createElement('div');
        //--Add style classes.
        containerHeader.classList.add('form-header');
        objectContainer.classList.add('pccr-object');

        //--Add object icon box.
        let iconBox = createIconBox(property.form);
        containerHeader.appendChild(iconBox);

        //--Get object name string.
        let nameString = Lang.getString(property.name);
        //--Add object name box.
        let nameBox = document.createElement('p');
        nameBox.classList.add('inline');
        //--Check availability of name string.
        if (nameString) {
          nameBox.innerHTML = nameString;
          containerHeader.appendChild(nameBox);
          //==Error case.
        } else {
          //--Visual feedback @dev.
          nameString = property.name + ' (!no match!)';
          nameBox.innerHTML = nameString;
          containerHeader.appendChild(nameBox);
        }
        //--Add object name to object container.
        objectContainer.setAttribute('name', property.name);
        //--Add object to form container.
        container.appendChild(objectContainer);
        objectContainer.appendChild(containerHeader);
        //==Handle specific location object.====================================
        if (property.form === 'location') {
          //--Create location object.
          let newLocationInput = document.createElement('location-input');
          newLocationInput.initElement(property, data);
          objectContainer.appendChild(newLocationInput);
          //--Handle generic element object.
        } else {
          //==Loop through object properties and add them to object cintainer.==
          for (let key in property.properties) {
            //--Check for the data object.
            if (data) {
              console.log(data);
              console.log(data[key]);
              //-Handle the date input field.
              if(['date', 'creation_date', 'birth_date',
                'death_date', 'start_date', 'end_date'].includes(key))
              {
                addInput(property.properties[key], objectContainer, data);
              }else {
                if(key === 'image_name'){
                  addInput(
                    property.properties[key],
                    objectContainer,
                    data['name']);
                }else{
                  addInput(
                    property.properties[key],
                    objectContainer,
                    data[key]);
                }
              }
            }else{
              addInput(property.properties[key], objectContainer);
            }
          }
        }
      } else
      //==Handle array forms.===================================================
      if (property.type === 'array') {
        //--Check for the data object.
        if (data) {
          //-Create array container.
          let arrayContainer = document.createElement('div');
          arrayContainer.classList.add('__array');
          for (var i = 0; i < data.length; i++) {
            //-Add array container to form container.
            container.appendChild(arrayContainer);
            //-Add first input field to array container.
            addInput(property.items, arrayContainer, data[i]);
            //-Add identifier for first array element.
            arrayContainer.childNodes[i].setAttribute('__arrayID', i);
          }
          //--Add add button to array container.
          addArrayElementButton(property.items, arrayContainer);
        }else{
          //--Create array container.
          let arrayContainer = document.createElement('div');
          arrayContainer.classList.add('__array');
          //--Add array container to form container.
          container.appendChild(arrayContainer);
          //--Add first input field to array container.
          addInput(property.items, arrayContainer);
          //--Add add button to array container.
          addArrayElementButton(property.items, arrayContainer);
          //--Add identifier for first array element.
          arrayContainer.childNodes[0].setAttribute('__arrayID', 0);
        }
        //==Error case.
      } else {
        console.log('Why am I here?');
        console.log('->unhandled type: ' + property.type);
        console.log('->expected form: ' + property.form);
      }
    };

  //============================================================================
  /**
   * Function to create dropdown from a list object.
   *
   * @param {object} list - An {@link Glossary.object|object} containing the initial list item's info.
   * @param {string} pageType - A {@link Glossary.PageType|Page Type} String.
   *
   * @memberof UI
   */
  let createDropdown =
    function(list, pageType) {
      //==Get the dropdown element.
      let dropdown = document.querySelector('#info-page-box #pageDropdown');
      //--Reset the dropdown.
      dropdown.innerHTML = '';
      //--Set the page type.
      dropdown.name = pageType;

      //==Add the list elements.
      for (let key in list) {
        //--Create the option element.
        let option = document.createElement('option');
        //--Add list item info.
        option.innerHTML = list[key];
        option.value = key;
        //--Add item to dropdown.
        dropdown.appendChild(option);
      }
    };

  //============================================================================
  /**
   * Function to create a form of certain type and layout
   * within the parent element container. <br>
   * Option to initialize the input field with existing data.
   *
   * @param {string} type - A {@link Glossary.string|string} consisting of the combination 'type/layout'.
   * @param {HTMLElement} [parent=The info #form-container element.]
   * The parent {@link Glossary.HTMLElement|HTMLElement}.
   * @param {Object} [data] - The data {@link Glossary.object|object} to initialize the form with.
   *
   * @memberof UI
   */
  let createForm =
    async function(
      type,
      parent = document.querySelector('#info-page-box #form-container'),
      data = undefined)
    {
      //==Name the parent container for processing purpouses.
      let container = parent;
      //--Reset that form container.
      container.innerHTML = '';
      //--Set the container type.
      container.type = type.split('/')[0];
      //--Add layout name to container.
      container.layout = type.split('/')[1].split('.')[0];
      //--Add form icon to container.
      let iconBox = createIconBox(type.split('/')[0]);
      container.appendChild(iconBox);

      //==Add nameBox to container.
      let nameBox = document.createElement('div');
      //--Add classes.
      nameBox.classList.add('inline');
      nameBox.classList.add('page-caption');

      //==Get name string from language object according to type.
      nameBox.innerHTML = Lang.getString(type.split('/')[0] + '_type');
      container.appendChild(nameBox);

      //==Get the data schema and template for the desired type.
      let promises = [];
      promises
        .push(
          Data.getFile('forms/data/', type.split('/')[0] + '.schema', 'json'));
      promises
        .push(
          Data.getFile('preview-phone/templates/', type, 'html'));

      //==Resolve previous promises.
      await Promise.all(promises).then(function() {
        //--Get the schema.
        let jsonSchema = arguments[0][0];
        //--Get the template elements by ID.
        let templateIdElements = arguments[0][1][0].querySelectorAll('*[id]');
        //--Get the template IDs.
        //--@see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map}
        let elementsIDs =
          Array.prototype.map.call(templateIdElements, el => el.id);
        console.log('========================================================');
        console.log(elementsIDs);
        //==Loop through JSONSchema
        for (let key in jsonSchema) {
          //--Examine the contained properties.
          if (key === 'properties') {
            //--Loop through properties and add corresponding input fields.
            for (let property in jsonSchema[key]) {
              //-Skip layout property & check agaist template IDs.
              if (property != 'layout' && elementsIDs.indexOf(property) > -1
                || property === 'language')
              {
                console.log(property);
                console.log(jsonSchema[key][property]);
                //-Add the corresponding input field to the container
                //(with initial data).
                if (data) {
                  addInput(jsonSchema[key][property], container,
                    data[jsonSchema[key][property].name]);
                }else{
                  addInput(jsonSchema[key][property], container);
                }
              }
            }

            //==Add the commit button at the bottom of the container.===========
            let commitButton = document.createElement('button');
            //--Add style class.
            commitButton.classList.add('btn');
            commitButton.classList.add('btn--page_commit');
            //==Get the label text from the Lang object.
            if(data){
              commitButton.innerHTML = Lang.getString('commitChanges');
              //--Add update click listener.
              commitButton.onclick = function() {
                //-Pass the updated commit target and existing document id.
                Data.commitForm(this, data.id);
              };
            }else{
              commitButton.innerHTML = Lang.getString('commit');
              //==Add commit click listener.
              commitButton.onclick = function() {
                //--Pass the commit target.
                Data.commitForm(this);
              };
            }

            //==Add button to the container.
            container.appendChild(commitButton);

            //==Error case (exclude expected JSONSchema values).
          } else if(!['$schema', 'type', 'name', 'sortBy', 'required',
            'additionalProperties'].includes(key))
          {
            console.log('Why am I here?');
            console.log('Unhandled key: ' + key);
          }
        }
      });
    };

  //============================================================================
  /**
   * Function to create a page selection grid from the data document object.
   *
   * @param {object} data - The data document object.
   * @param {string} pageType - A {@link Glossary.PageType|Page Type} string.
   * @param {string} sortBy - The field name to sort the entries by.
   * @param {HTMLElement} container - The container holding the grid items.
   * @param {boolean} [language] - The language to filter for.
   *
   * @memberof UI
   */
  let createGridItems =
    async function(data, pageType, sortBy, container, language = undefined) {
      //==Reset the container.
      container.innerHTML = '';

      //==Loop through the data document object.
      data.forEach(function(doc) {
        //--Check language flag.
        if (language === true) {
          console.log(doc.data());
          //-Add item to grid only if in desired language.
          if (doc.data().language === AppEditor.language) {
            createGridItem(doc, pageType, sortBy, container);
          }else {
            console.log('no language flag');
          }
          //==Language does not matter.
        }else{
          //-Add item to grid.
          createGridItem(doc, pageType, sortBy, container);
        }
      });
    };

  //============================================================================
  /**
   * Function to create a grid item screen from the document object.
   *
   * @param {object} doc - The document object.
   * @param {string} pageType - A {@link Glossary.PageType|Page Type} string.
   * @param {string} sortBy - The field name to sort the entries by.
   * @param {HTMLElement} container - The container holding the grid items.
   *
   * @memberof UI
   * @private
   */
  let createGridItem =
    function(doc, pageType, sortBy, container){
      //==Create grid page screen container.
      let box = document.createElement('div');
      box.classList.add('editor-page');
      box.classList.add('grid-page');

      //==Check for question type.
      if(pageType === 'question'){
        box.onclick = function(e) {
          let pageID = e.currentTarget.firstChild.page_id;
          Data.renderItemData(pageID, pageType, true);
          UI.showElement('#quiz-editor-pane #form-container');

          UI.hideElement('#quiz-editor-pane #grid-container');

          UI.showElement('.btn_add-page-to-app');

          //--Enable 'CREATE' buttons.
          let buttons =
            document.querySelectorAll(
              '#quiz-editor-box .editor-controls .editor-controls__item'
            )[0].querySelectorAll('button');

          for(button of buttons){
            button.classList.remove('inactiveBtn');
            button.disabled = false;
          }
        };
      }else{
        box.onclick = function(e) {

          console.log('Type: %s, ID: %s',
            e.currentTarget.firstChild.type,
            e.currentTarget.firstChild.page_id);

          let parent = Phone.findActivePreviewPhone();
          console.log(parent);

          Phone.setPhoneAttributes(
            parent,
            e.currentTarget.firstChild.page_id,
            pageType,
            doc.data().layout);

          parent.innerHTML = e.currentTarget.firstChild.innerHTML;

          //==Expected in page editor.
          try{
            parent.parentElement.parentElement.querySelector('.footer-buttons')
              .classList.remove('hidden');
            //==Expected in app editor.
          }catch(e){
            console.log('No footer buttons found.');
          }

          //==Expected in app editor.
          try{
            parent.parentElement.querySelector('.btn_add-page-to-app')
              .classList.remove('hidden');
            //==Expected in page editor.
          }catch(e){
            console.log('No "ADD" button found.');
          }
        };
      }

      //==Create screen element.
      let phone = document.createElement('div');
      phone.classList.add('screen');
      phone.classList.add('small-screen');

      Phone.setPhoneAttributes(
        phone,
        doc.id,
        pageType,
        doc.data().layout);

      box.appendChild(phone);
      container.appendChild(box);

      //==Create preview phone element.
      let griditem = new PreviewPhone();
      let layout = pageType + '/' + doc.data().layout;

      griditem.initElement(doc.data(), layout, phone);
    };

  //============================================================================
  /**
   * Function to create an icon box containing an fontawesome icon for the page type.
   *
   * @param {string} pageType - A {@link Glossary.PageType|Page Type} string.
   *
   * @return {HTMLElement} An element containing the icon specified in the file.
   *
   * @see {@link ../app-framework/util/data/fontawesome.json}
   * @see {@link https://fontawesome.com/icons?d=gallery&m=free|Fontawesome}
   *
   * @memberof UI
   * @private
   */
  let createIconBox =
    function(pageType) {
      //==Create new div element.
      let iconBox = document.createElement('div');
      //--Add style classes.
      iconBox.classList.add('object-imageContainer');
      iconBox.classList.add('inline');

      //==Create new i element.
      let icon = document.createElement('i');
      //--Add fontawesome classes
      icon.classList.add(FA[pageType].mod);
      icon.classList.add(FA[pageType].id);

      //==Put in container div.
      iconBox.appendChild(icon);

      return iconBox;
    };

  //============================================================================
  /**
   * Function to create item list from data object with id & sortBy field.
   *
   * @param {object} data - The data object.
   * @param {object} sortBy - The field to sort the data by.
   * @return {object} The item list.
   *
   * @memberof UI
   */
  let createItemList =
    function(data, sortBy) {
      let list = {};
      data.forEach(function(doc) {
        list[doc.id] = doc.data()[sortBy];
      });
      return list;
    };

  //============================================================================
  /**
   * Function to create an entry form
   * with a certain page type and display the layout in a preview phone element.
   *
   * @param {string} pageType - A {@link Glossary.PageType|Page Type} String.
   *
   * @memberof UI
   */
  let createPageForm =
    function(pageType) {
      //==Generate the needed form.
      createForm(pageType);

      //==Preview empty layout.
      let promises = [];
      //==Create promise for template html file.
      promises
        .push(Data.getFile('preview-phone/templates/', pageType, 'html'));
      //==Resolve promises made above.
      Promise.all(promises).then(function() {
        //--Get preview phone.
        let parent = Phone.findActivePreviewPhone();

        console.log('Phone: ', parent);

        let layout = pageType.split('/');
        Phone.setPhoneAttributes(parent, '', layout[0], layout[1].split('.')[0]);

        parent.innerHTML = (arguments[0][0][0]).innerHTML;
      });

      //==Set target ID for navigation.
      let target = {};
      target.id = 'create-info-form';
      //--Navigate to form.
      Click.navigateTo(target);
    };

  //============================================================================
  /**
   * Function to scale the font size of a text to fit the parent container.
   *
   * @param {HTMLELement} element - The element.
   * @param {string} text - The text.
   * @param {number} [fontWidth = 12] - The amount of characters per row.
   *
   * @memberof UI
   */
  let scaleFont =
    function(element, text, fontWidth = 12) {
      //==Get the element width.
      let elementWidth = element.style.width;

      //==Get the text length.
      let textLength = text.length;
      if(element.id === 'text'){
        //==Allow 5 rows.
        textLength = textLength / 5;
      }

      //==Calculate font size.
      let fontSize = (fontWidth/textLength*100);

      if (fontSize > 100) {
        fontSize = 100;
      }else if(fontSize < 0){
        fontSize = 100;
      }else if(fontSize < 50){
        fontSize = 50;
      }
      element.style.fontSize = fontSize + '%';
    };

  //============================================================================
  /**
   * Function to render raw item data to the output container.
   * @param {Object} data - The page data object.
   *
   * @memberof UI
   */
  let showRawPageData =
    function(data) {
      //==Put data to output element.
      let el = document.querySelector('#info-page-box #formOutput');
      el.innerHTML = Data.syntaxHighlight(data);

      //==Show the form output container.
      document.querySelector('#info-page-box #formOutput-container')
        .classList.add('show-formOutputContainer');
    };

  //============================================================================
  //============================================================================

  //============================================================================
  /**
   * Function to show a DOM-Element.
   * @param {string} elementQueryString - The string to identify the element.
   *
   * @memberof UI
   */
  let showElement =
    function(elementQueryString){
      document.querySelector(elementQueryString).classList.remove('hidden');
      document.querySelector(elementQueryString).classList.add('show');
    };

  //============================================================================
  /**
   * Function to hide a DOM-Element.
   * @param {string} elementQueryString - The string to identify the element.
   *
   * @memberof UI
   */
  let hideElement =
    function(elementQueryString){
      document.querySelector(elementQueryString).classList.remove('show');
      document.querySelector(elementQueryString).classList.add('hidden');

    };

  //============================================================================
  /**
   * Function to reset the text of a DOM-Element.
   * @param {string} elementQueryString - The string to identify the element.
   *
   * @memberof UI
   */
  let resetElementText =
    function(elementQueryString){
      document.querySelector(elementQueryString).innerHTML = '';
    };
    //----------------------------------------------------------------------------

  //============================================================================
  //==Make methods available on the namespace Object.
  this.createDropdown = createDropdown;
  this.createForm = createForm;
  this.createGridItems = createGridItems;
  this.createItemList = createItemList;
  this.createIconBox = createIconBox;
  this.createPageForm = createPageForm;
  this.scaleFont = scaleFont;
  this.showRawPageData = showRawPageData;

  this.showElement = showElement;
  this.hideElement = hideElement;
  this.resetElementText = resetElementText;
  //============================================================================
}).apply(UI);

//==============================================================================
/**
 * Extend the String prototype to process format literals.
 *
 * @param {object} args - An object containing key value pairs to be filled into the base string.
 *
 * @return {string} The finished string.
 *
 * @memberof UI
 *
 * @see {@link https://stackoverflow.com/questions/1038746/equivalent-of-string-format-in-jquery/2648463#2648463|stackoverflow}
 */
String.prototype.format =
  function(args) {
    let newStr = this;
    for (let key in args) {
      newStr = newStr.replace('{' + key + '}', args[key]);
    }
    return newStr;
  };
//==============================================================================
//==EOF=========================================================================
