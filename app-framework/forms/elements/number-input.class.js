//==============================================================================
/**
 * Class representing a NumberInput element. <br>
 * The visual representation can be found here:
 * [NumberInput]{@link http://localhost:8887/styleguide/section-input.html#input.NumberInput}
 * @extends BasicFormElement
 * @memberof Inputs
 */
class NumberInput extends BasicFormElement {
  /**
   * Empty constructor.
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   * This method initializes the specific input attributes of a NUMBER input element.
   * @property {string}  name - The name of the element.
   * @property {number}  minimum - The maximum for the input number.
   * @property {number}  maximum - The minimum for the input number.
   */
  initAttributes() {
    //==Set constraints string for the NUMBER element.
    this.firstElementChild.querySelector('.form-constraints').innerHTML =
      Lang.getString('number_constraints').format({
        'type': this.attributes.type,
        'min': this.attributes.minimum,
        'max': this.attributes.maximum
      });

    //==Get input field from the template.
    let numberInput = this.firstElementChild.querySelector('input');

    //==Set the listener for the in phone preview.
    numberInput.onkeyup = function(event){
      console.log(parseInt(event.target.max) < parseInt(event.target.value));
      if(parseInt(event.target.max) < parseInt(event.target.value)){
        event.target.value = event.target.max;
      } else if(parseInt(event.target.min) > parseInt(event.target.value)){
        event.target.value = event.target.min;
      }
      //==Put entered data into the previw phone.
      try {
        //==Get the phone preview container.
        let phone =  document.querySelector('#phone-container')
          .querySelector('#'+numberInput.name + this.inArray(event.target));

        phone.innerHTML = numberInput.value;
        //==Error case.
      } catch (e) {
        console.log('No preview possible!');
        console.log(e);
      }
    }.bind(this);

    //==Loop through attributes and handle all expected NUMBER attributes.
    for (let key in this.attributes) {
      if (key === 'name') {
        //==Set the name attribute.
        numberInput.setAttribute('name', this.attributes[key]);
        //==Set the placeholder text.
        this.firstElementChild.querySelector('.form-placeholder').innerHTML =
          Lang.getString(this.attributes[key]);
        //==Set the description text.
        this.firstElementChild.querySelector('.form-description').innerHTML =
          Lang.getString(this.attributes.description);
      }
      //==Set constraints for visual feedback of the input field.
      if (key === 'minimum') {
        numberInput.setAttribute('min', this.attributes[key]);
      }
      if (key === 'maximum') {
        numberInput.setAttribute('max', this.attributes[key]);
      }
    }
    //==Set initial data.
    if(this.data){
      numberInput.value = this.data;
    }else{
      console.log('NO DATA');
    }
  }

  /**
   * This method resolves the internal data fields and returns an object.
   * @return {object} The data entered. <br>
   * @example
   * Structure  - {fieldName : inputNUMBERvalue} <br>
   * Values     - {"fieldName": 42}
   */
  getData() {
    console.log('DATA N');
    //==Create the return object.
    let data = {};
    //==Get the input element.
    let numberInput = this.firstElementChild.querySelector('input');
    //==Add inputValue to return object.
    data[numberInput.name] = Number.parseInt(numberInput.value);

    return data;
  }
}
//==============================================================================
//==EOF=========================================================================
