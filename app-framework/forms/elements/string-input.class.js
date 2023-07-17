//==============================================================================
/**
 * Class representing a StringInput element. <br>
 * The visual representation can be found here:
 * [StringInput]{@link http://localhost:8887/styleguide/section-input.html#input.StringInput}
 * @extends BasicFormElement
 * @memberof Inputs
 */
class StringInput extends BasicFormElement {
  /**
   *Empty constructor.
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   * This method initializes the specific attributes of a STRING input element.
   * @property {string}  name - The name of the element.
   * @property {number}  minLength - The maximum length for the input string.
   * @property {number}  maxLength - The minimum length for the input string.
   * @property {object}  enum - May contain values the input is restricted to.
   */
  initAttributes() {
    //==Set default constraints string for the STRING element.
    this.firstElementChild.querySelector('.form-constraints').innerHTML =
      Lang.getString('string_constraints').format({
        'type': this.attributes.type,
        'min': this.attributes.minLength,
        'max': this.attributes.maxLength
      });

    //==Get input field from the template.
    let stringInput = this.firstElementChild.querySelector('input');


    //==Set the listener for the in phone preview.
    stringInput.onkeyup = function(event) {
      //==Put entered data into the previw phone.
      try {
        let parent = Phone.findActivePreviewPhone();
        let phone = parent
          .querySelector('#'+stringInput.name + this.inArray(event.target));
        phone.innerHTML = stringInput.value;

        //==Error case.
      } catch (e) {
        console.log('No preview possible!');
        console.log(e);
      }
    }.bind(this);

    //==Loop through attributes  and handle all expected STRING attributes.
    for (let key in this.attributes) {
      if (key === 'name') {
        //==Set the name attribute.
        stringInput.setAttribute(key, this.attributes[key]);

        //==Set the placeholder text.
        this.firstElementChild.querySelector('.form-placeholder').innerHTML =
          Lang.getString(this.attributes[key]);
        //==Set the description text.
        this.firstElementChild.querySelector('.form-description').innerHTML =
          Lang.getString(this.attributes.description);
      }
      //==Change input field to enum with given values.
      if (key === 'enum') {
        //==Create dropdown for enum values with name attribute attached.
        let newSelect =
          this.createSelect(this.attributes[key], this.attributes['name']);
        //==Replace the input field with the dropdown.
        stringInput.parentNode.replaceChild(newSelect, stringInput);
        //==Set initial data.
        if(this.data){
          newSelect.value = this.data;
        }

        //==Set the new listener for the in phone preview.
        newSelect.onchange = function(event) {
          //==Put selected data into the previw phone.
          try {
            let parent = Phone.findActivePreviewPhone();
            let phone = parent
              .querySelector('#'+newSelect.name + this.inArray(event.target));
            phone.innerHTML =   Lang.getString(newSelect.value);

            //==Error case.
          } catch (e) {
            //==Check if language flag
            if(stringInput.name != 'language'){
              console.log('No preview possible!', e);
            }
          }
        }.bind(this);


        if(stringInput.name === 'language' && !this.data){
          newSelect.value = Lang.__LANG;
        }

        //==Change description text.
        this.firstElementChild.querySelector('.form-constraints').innerHTML =
          Lang.getString('enum_constraints');
      }
      //==Set constraints for visual feedback of the input field.
      if (key === 'minLength') {
        stringInput.setAttribute('minlength', this.attributes[key]);
      }
      if (key === 'maxLength') {
        stringInput.setAttribute('maxlength', this.attributes[key]);
      }
    }
    //==Set initial data.
    if(this.data){
      stringInput.value = this.data;
    }else{
      console.log('NO DATA');
    }
  }

  /**
   * This method resolves the internal data fields and returns an object.
   * @return {object}
   * The entered data.
   * @example
   * Structure  - {fieldName : inputSTRINGvalue} <br>
   * Values     - {"fieldName": "This is the input STRING"}
   */
  getData() {
    console.log('DATA S');
    //==Create the return object.
    let data = {};
    let stringInput;
    //==Get the input or select element.
    if (this.firstElementChild.querySelector('input')) {
      stringInput = this.firstElementChild.querySelector('input');
    } else {
      stringInput = this.firstElementChild.querySelector('select');
    }
    let name = stringInput.name;

    //==remove unneccesary modiefiers
    if(name.split('_')[0] === 'anno'){
      console.log('123');
      name = name.split('_')[0];
      console.log(name);
    }
    //==Add inputValue to return object.
    data[name] = stringInput.value;
    return data;
  }

  /**
   * Create and return a select element containing the passed values.
   * @param {Array} array The array containing possible string values.
   * @param {string} name The name string.
   *
   * @return {HTMLElement}
   * The select element.
   */
  createSelect(array, name) {
    //==Create a select element.
    let newSelect = document.createElement('select');
    newSelect.setAttribute('name', name);
    newSelect.classList.add('stringInput');

    //==Add a default option without value.
    let newOption = document.createElement('option');
    newOption.value = '';
    //==Set label for default option.
    newOption.innerHTML = Lang.getString('choose');
    //==Add default option to select element.
    newSelect.appendChild(newOption);

    //==Add enum options.
    for (let i = 0; i < array.length; i++) {
      //==Create a option.
      newOption = document.createElement('option');
      //==Add the value.
      newOption.value = array[i];
      //==Add the label.
      newOption.innerHTML = Lang.getString(array[i]);
      //==Add option to the select element.
      newSelect.appendChild(newOption);
    }
    return newSelect;
  }
}
//==============================================================================
//==EOF=========================================================================
