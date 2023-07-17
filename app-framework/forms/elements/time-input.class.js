//==============================================================================
//CLASS
/**
 * Class representing a TimeInput element. <br>
 * The visual representation can be found here:
 * [DateInput]{@link http://localhost:8887/styleguide/section-input.html#input.DateInput}
 * @extends BasicFormElement
 * @memberof Inputs
 */
class TimeInput extends BasicFormElement {
  /**
   *Empty constructor.
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   * This method initializes the specific input attributes.
   * @property {string}  name - The name of the element.
   * @todo Generalize phone preview.
   */
  initAttributes() {
    //==Set constraints string for the TIME element.
    this.firstElementChild.querySelector('.form-constraints').innerHTML =
      Lang.getString('time_constraints');

    //==Get input field from the template.
    let timeInput = this.firstElementChild.querySelector('input');

    //==Set the listener for the in phone preview.
    timeInput.onchange = timeInput.onkeyup = function(event){

      //TODO: Check Only in object form?
      //Maybe add name to input element in create-schema-form.js@128
      let some = timeInput.parentNode.parentNode.parentNode;

      //==In phone preview
      let phone =  document.querySelector('#phone-container')
        .querySelector('#'+some.getAttribute('name'))
        .querySelector('#'+timeInput.name);
      phone.innerHTML = timeInput.value;
    };

    //==loop through attributes  and handle all expected.
    for (let key in this.attributes) {
      if (key === 'name') {
        //==Set name attribute.
        timeInput.setAttribute(key, this.attributes[key]);
        //==Set preview value.
        timeInput.value = '00:00';

        //==Set the placeholder text.
        this.firstElementChild.querySelector('.form-placeholder').innerHTML =
          Lang.getString(this.attributes[key]);
        //==Set the description text.
        this.firstElementChild.querySelector('.form-description').innerHTML =
          Lang.getString(this.attributes.description);
      }
    }
    //==Set initial data.
    if(this.data){
      timeInput.value = this.data;
    }else{
      console.log('NO DATA');
    }
  }

  /**
   * This method resolves the internal data fields and returns an object.
   * @return {object}
   * The data entered.
   * @example
   * Structure  - {fieldName : inputSTRINGvalue} <br>
   * Values     - {"fieldName": "HH:MM:SS"}
   *
   * @see
   * Value structure: [RFC3339 - 5.6 Date/Time Format]{@link https://tools.ietf.org/html/rfc3339}
   */
  getData() {
    console.log('DATA T');
    //==Create the return object.
    let data = {};
    //==Get the input field.
    let timeInput = this.firstElementChild.querySelector('input');
    //==Add inputValue to return object comply to rfc3339 time.
    //== source: https://tools.ietf.org/html/rfc3339
    data[timeInput.name] = timeInput.value +':00';
    return data;
  }
}
//==============================================================================
//==EOF=========================================================================
