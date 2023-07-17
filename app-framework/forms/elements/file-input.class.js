//==============================================================================
/**
 * Class representing a FileInput element. <br>
 * The visual representation can be found here:
 * [FileInput]{@link http://localhost:8887/styleguide/section-input.html#input.ImageInput}
 * @extends BasicFormElement
 * @memberof Inputs
 */
class FileInput extends BasicFormElement {
  /**
   *Empty constructor.
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   * This method sets the element's attributes and
   * sets the element's template to initialize the element.
   * <br>
   * This method initializes FILE input element with the media property.
   * @param {object} properties - The element's properties.
   * @param {object} data - The element's existing data (to insert for change).
   * @overrides
   */
  initElement(properties, data) {
    //==Move to set template.
    this.attributes = properties;
    this.data = data;
    this.setTemplate(properties.media);
  }

  /**
   * This method initializes the specific attributes of a FILE input element.
   * @property {string}  name - The name of the element.
   */
  initAttributes() {
    console.log(this.data);
    //==Set default constraints string & Set file size.
    this.firstElementChild.querySelector('.form-constraints').innerHTML =
    Lang.getString('file_constraints').format({
      'size': this.attributes.size
    });

    //==IF IMAGE================================================================
    //==Get input field from template.
    let imageInput = this.firstElementChild.querySelector('input');

    let imageInputLabel =
      this.firstElementChild.querySelector('.imageInputLabel');

    imageInputLabel.onclick = function() {
      imageInput.click();
    };

    imageInput.onchange = function(event) {
      //==In form preview

      let output = this.firstElementChild.querySelector('.imagePreview');
      output.src = URL.createObjectURL(event.target.files[0]);
      let phone = Phone.findActivePreviewPhone();
      //==In form name imagePreview
      let formName = this.parentElement.childNodes[2].querySelector('input');
      formName.value = event.target.files[0].name;
      console.log(this.parentElement.getAttribute('name'));

      try {
        //==In phone preview
        if(this.parentElement.getAttribute('name') === 'logo'){
          let parent = phone.querySelector('#logo-image');
          parent.src = URL.createObjectURL(event.target.files[0]);
        }else{
          let parent = phone.querySelector('#full-image');
          parent.src = URL.createObjectURL(event.target.files[0]);
        }
      } catch (e) {
        console.log('Error:', e);
      }

      this.src = event.target.files[0];

    }.bind(this);

    //==Loop through attributes  and handle all expected.
    for (let key in this.attributes) {
      if (key === 'name') {
        //==Set name attribute.
        imageInput.setAttribute(key, this.attributes[key]);
        //==Set date type --> ADDS native date picker in chrome.
        imageInput.setAttribute('type', 'file');

        //==Add placeholder text.
        this.firstElementChild.querySelector('.form-placeholder').innerHTML =
          Lang.getString(this.attributes[key]);
      }
      if (key === 'description') {
        this.firstElementChild.querySelector('.form-description').innerHTML =
          Lang.getString(this.attributes.description);

        this.firstElementChild.querySelector('.imageInputButton').innerHTML =
            Lang.getString('cooseFile');
      }
    }
  }

  /**
   * This method sets the template for the file input type.
   * @param {string} type The input type.
   */
  setTemplate(type) {
    //==Setup promise.
    let promises = [];
    promises
      .push(Data.getFile('forms/templates/', type + '-input', 'html'));

    Promise.all(promises).then(function() {
      //==Get the first container within the template.
      this.appendChild(arguments[0][0][0].firstElementChild);
      //==Initialize the available attributes.
      this.initAttributes();
      //==Bind the element itself to connect the template on callback.
    }.bind(this));
  }

  /**
   * This method resolves the internal data fields and return  an object. <br>
   * Uploads the file and put reference ID into the return value object.
   * @return {object}
   The reference path for the chosen file.
   * @example
   * Structure  - {fieldName : inputFILEreferenceID} <br>
   * Values     - {"fieldName": "path"}
   */
  getData() {
    if (this.data && !this.src) {
      return {
        'image_path': this.data
      };
    }
    let storageRef = firebase.storage().ref();
    let storageID = new Date().getTime();
    try {
      let imageRef = storageRef
        .child('images/' + storageID + '.' + this.src.name.split('.')[1]);

      //==Resolve file upload.
      let file = this.src;
      imageRef.put(file).then(function(snapshot) {
        console.log('Uploaded a file!');
      });
      return {
        'image_path': 'images/' + storageID + '.' + file.name.split('.')[1]
      };
    } catch (e) {
      console.log('Error:', e);
      return {
        'image_path': undefined
      };
    }
  }
}
//==============================================================================
//==EOF=========================================================================
