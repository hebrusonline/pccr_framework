//==============================================================================
//==CLASS
/**
 * Class representing a PreviewPhone. <br>
 * @extends HTMLElement
 * @memberof Phone
 */

class PreviewPhone extends HTMLElement {
  /**
   *Empty constructor.
   * @constructor
   */
  constructor() {
    super();
  }

  //SETTER & GETTER
  /**
   * Setter for the attributes.
   * @param {Object} attributes - The attributes object.
   */
  set attributes(attributes) {
    this._attributes = attributes;
  }
  /**
   * Getter for the attributes.
   * @return {Object} The attributes object.
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
   * @return {NodeList} The template NodeList.
   */
  get templates() {
    return this._templates;
  }

  /**
   * Setter for the layout.
   * @param {string} layout - The layout string.
   */
  set layout(layout) {
    this._layout = layout;
  }
  /**
   * Getter for the layout.
   * @type {HTMLElement}
   */
  get layout() {
    return this._layout;
  }

  /**
   * Setter for the parent element.
   * @param {HTMLElement} parent - The parent element.
   */
  set parent(parent) {
    this._parent = parent;
  }
  /**
   * Getter for the parent element.
   * @type {HTMLElement}
   */
  get parent() {
    return this._parent;
  }

  /**
   * Initialize the Element.
   * @param {Object} properties - The element's properties.
   * @param {string} layout     - The element's layout.
   * @param {HTMLElement} [parent='The form preview phone'] - The element's parent.
   */
  initElement(
    properties,
    layout,
    parent = document.querySelector('#preview-phone')
  ) {
    //==Set the attributes.
    this.attributes = properties;
    //==Set parent element.
    this.parent = parent;
    //==Set the layout.
    this.layout = layout.split('.')[0];
    //==Set the corresponding template.
    this.setTemplate();
  }

  /**
   * Setup the template.
   */
  setTemplate() {
    console.log(this.layout);
    let style = this.layout;

    //==Adds layout indicator for file identification.
    if (!style.includes('.layout')) {
      style = style + '.layout';
    }

    let promises = [];
    //==Create promise for template html file.
    promises
      .push(Data.getFile('preview-phone/templates/', style, 'html'));
    //==Resolve promises made above.
    Promise.all(promises).then(function() {
      //==Add template structure to this.
      this.appendChild(arguments[0][0][0]);
      //==Initilaize attributes by matching them to corresponding elements.
      this.initAttributes();
      //==Bind this context.
    }.bind(this));
  }

  /**
   * Initialize the attributes.
   */
  initAttributes() {
    //==Loop through the attributes object.
    let hasMap = false;
    let coords = {};
    for (let key in this.attributes) {
      //==Check if field for attribute value exists.
      if (this.firstElementChild.querySelector('#' + key)) {
        let field = this.firstElementChild.querySelector('#' + key);
        if (key === 'image') {
          //==Put image into field.
          let storageRef = firebase.storage().ref();
          let imageRef = storageRef.child(this.attributes[key].image_path);
          imageRef.getDownloadURL().then(function(url) {
            //--Insert url into an <img> tag to "download"
            this.parent.querySelector('#full-image').src = url;
          }.bind(this)).catch(function(error) {
            console.log(error);
          });
        } else if (key === 'logo') {
          //==Put image into field.
          let storageRef = firebase.storage().ref();
          let imageRef = storageRef.child(this.attributes[key].image_path);
          imageRef.getDownloadURL().then(function(url) {
            // Insert url into an <img> tag to "download"
            this.parent.querySelector('#logo-image').src = url;
          }.bind(this)).catch(
            function(error) {
              console.log(error);
            });
        } else if (key === 'location') {
          //==Prepare for map to be assambled.
          coords = this.attributes[key];
          //--Set map indicator.
          hasMap = true;
          field.querySelector('#latitude').innerHTML
            = this.attributes[key].latitude;
          field.querySelector('#longitude').innerHTML
            = this.attributes[key].longitude;
        }else if (key === 'size') {
          //==Set values for size attribute.
          field.querySelector('#measure').innerHTML
            = this.attributes[key].measure;
          field.querySelector('#unit').innerHTML =
            Lang.getString(this.attributes[key].unit);
        } else if (key === 'date' || key === 'creation_date'
          || key === 'birth_date' || key === 'death_date'
          || key === 'start_date' || key === 'end_date')
        {
          //==Set correct date values.
          field.innerHTML = this.attributes[key].date;
          let range = '';
          if (this.attributes[key].range) {
            console.log(this.attributes[key].range);
            switch (this.attributes[key].range) {
              case 'first_quarter':
                range = ' 1/4';
                break;
              case 'second_quarter':
                range = ' 2/4';
                break;
              case 'third_quarter':
                range = ' 3/4';
                break;
              case 'fourth_quarter':
                range = ' 4/4';
                break;
              case 'first_third':
                range = ' 1/3';
                break;
              case 'second_third':
                range = ' 2/3';
                break;
              case 'third_third':
                range = ' 3/3';
                break;
              case 'first_half':
                range = ' 1/2';
                break;
              case 'second_half':
                range = ' 2/2';
                break;
              default:
                range = ' RANGE';
            }
            field.innerHTML = field.innerHTML + ' ' + range;
          }
          if (this.attributes[key].mod) {
            if(this.attributes[key].mod === 'date_century'){
              let century = '1';
              if(this.attributes[key].date > 100){
                century
                  = parseInt(this.attributes[key].date.substring(0, 1)) + 1;
              }
              if(this.attributes[key].date > 1000){
                century
                  = parseInt(this.attributes[key].date.substring(0, 2)) + 1;
              }
              let split = '.';
              field.innerHTML = century + Lang.getString('century') + range;
            }
          }
          //==Fit font to container size.
          UI.scaleFont(field, field.innerHTML, 8);
          field.nextElementSibling.innerHTML
            = Lang.getString(this.attributes[key].anno);
        } else if (
          ['monday', 'tuesday',
            'wednesday', 'thursday',
            'friday', 'saturday', 'sunday'].includes(key)
        ) {
          //==Set values for opening hours.
          if (this.attributes[key].closed === undefined) {
            field.querySelector('#opening_time').innerHTML
              = this.attributes[key].opening_time;
            field.querySelector('#closing_time').innerHTML
              = this.attributes[key].closing_time;
          } else {
            field.querySelector('#closed').innerHTML
              = this.attributes[key].closed;
            field.setAttribute('closed', this.attributes[key].closed);
          }
        } else if (key === 'rate') {
          //--Loop through rate array.
          for (let item in this.attributes[key]) {
            //-Clone rate template.
            let arrayField;
            arrayField = field.cloneNode(true);
            //-Set values.
            for (let innerItem in this.attributes[key][item]) {
              arrayField.querySelector('#' + innerItem).innerHTML =
                this.attributes[key][item][innerItem];
            }
            //-Add rate to parent.
            field.parentElement.append(arrayField);
          }
        } else if (key === 'keywords') {
          //--Loop through keywords array.
          for (let item in this.attributes[key]) {
            //-Clone keyword template.
            let arrayField;
            arrayField = field.cloneNode(true);
            //-Set values.
            for (let innerItem in this.attributes[key][item]) {
              arrayField.querySelector('#' + innerItem).innerHTML
                = this.attributes[key][item][innerItem];
            }
            //-Add keyword to parent.
            field.parentElement.append(arrayField);
          }
        } else if(key === 'blocks'){
          //--Add room grid to preview phone.
          field.innerHTML =
            AreaEditor.assembleRoom(
              this.attributes[key], this.attributes['size']
            ).innerHTML;
        }else if(key === 'questions'){
          //--Add number of questions to preview phone.
          field.querySelector('.number_of_questions').innerHTML =
            this.attributes['questions'].length;
        }else {
          //==Set value to field.
          field.innerHTML = this.attributes[key];

          //==Adapt font size to container capacity.
          if (field.id === 'text') {
            UI.scaleFont(field, this.attributes[key], 30);
          }else if(field.parentNode.classList.contains('infobox-entry')){
            UI.scaleFont(field, this.attributes[key], 10);
          }else{
            UI.scaleFont(field, this.attributes[key]);
          }
        }
      }
    }
    //==Add "Create" button if template is used for layout preview.
    if (this.parent.parentElement.id === 'layoutContainer') {
      //--Create the button.
      let button = document.createElement('button');
      //--Add a click listener.
      button.setAttribute(
        'onclick', 'UI.createPageForm(\'' + this.layout + '.layout' + '\')'
      );
      //--Add the button text.
      button.innerHTML = langJSON.util.button_text.create;

      //--Clear footer and add button.
      this.querySelector('.preview-phone__footer').innerHTML = '';
      this.querySelector('.preview-phone__footer').appendChild(button);
    }
    //==Add rendered preview to parent element.
    this.parent.setAttribute('layout', this.layout.split('/')[1].split('.')[0]);
    this.parent.innerHTML = this.firstElementChild.innerHTML;
    this.parent.firstElementChild.pageid = this.attributes.id;
    //==Assable map preview.
    if (hasMap) {
      let map = new google.maps.Map(this.parent.querySelector('#location'), {
        center: {
          lat: coords.latitude,
          lng: coords.longitude
        },
        zoom: 15
      });
      let mark = new google.maps.Marker({
        map: map,
        position: {
          lat: coords.latitude,
          lng: coords.longitude
        },
        draggable: false
      });
    }
  }
}
//==============================================================================
//==EOF=========================================================================
