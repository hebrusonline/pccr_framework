//==============================================================================
/**
 * Class representing a TextInput element. <br>
 * The visual representation can be found here:
 * [TextInput]{@link http://localhost:8887/styleguide/section-input.html#input.TextInput}
 * @extends BasicFormElement
 * @memberof Inputs
 */
class TextInput extends BasicFormElement {
  /**
   *Empty constructor.
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   * This method initializes the specific attributes of a TEXT input element.
   * @property {string}  name - The name of the element.
   * @property {number}  minLength - The maximum length for the input string.
   * @property {number}  maxLength - The minimum length for the input string.
   */
  initAttributes() {
    //==Necessary for validation purouses, since schema type equals string.
    let thisType = 'text';
    //==Set default constraints string for the TEXT element.
    this.firstElementChild.querySelector('.form-constraints').innerHTML =
      Lang.getString('text_constraints').format({
        'type': thisType,
        'min': this.attributes.minLength,
        'max': this.attributes.maxLength
      });

    //==Get input field from the template.
    let textInput = this.firstElementChild.querySelector('textarea');

    //==Set the listener for the in phone preview.
    textInput.onkeyup = function(event){
      //==Put entered data into the previw phone.
      try {
        let parent = Phone.findActivePreviewPhone();
        let phone = parent
          .querySelector('#'+textInput.name + this.inArray(event.target));
        phone.innerHTML = textInput.value;

        //==Error case.
      } catch (e) {
        console.log('No preview possible!');
        console.log(e);
      }
    }.bind(this);

    //==Loop through attributes  and handle all expected.
    for (let key in this.attributes) {
      if (key === 'name') {
        textInput.setAttribute(key, this.attributes[key]);
        //==Set the input type.
        textInput.setAttribute('type', 'text');

        //==Set the placeholder text.
        this.firstElementChild.querySelector('.form-placeholder').innerHTML =
          Lang.getString(this.attributes[key]);
        //==Set the description text.
        this.firstElementChild.querySelector('.form-description').innerHTML =
          Lang.getString(this.attributes.description);
      }
      //==Set constraints for visual feedback of the input field.
      if (key === 'minLength') {
        textInput.setAttribute('minlength', this.attributes[key]);
      }
      if (key === 'maxLength') {
        textInput.setAttribute('maxlength', this.attributes[key]);
      }
    }
    //==Set initial data.
    if(this.data){
      textInput.value = this.data;
    }else{
      console.log('NO DATA');
    }
  }

  /**
   * This method resolves the internal data fields and returns an object.
   * @return {object}
   * The data entered.
   * @example
   * Structure  - {fieldName : inputTEXTvalue} <br>
   * Values     - {"fieldName": "This is the input TEXT"}
   */
  getData() {
    console.log('DATA T');
    //==Create the return object.
    let data = {};
    //==Get the input element.
    let textInput = this.firstElementChild.querySelector('textarea');
    //==Add inputValue to return object.
    data[textInput.name] = textInput.value;
    return data;
  }
}
//==============================================================================
//==EOF=========================================================================
