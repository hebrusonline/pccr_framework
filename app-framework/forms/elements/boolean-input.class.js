//==============================================================================
/**
 * Class representing a BooleanInput element. <br>
 * The visual representation can be viewed here:
 * [BooleanInput]{@link http://localhost:8887/styleguide/section-input.html#input.BooleanInput}
 * @extends BasicFormElement
 *
 * @memberof Inputs
 */
class BooleanInput extends BasicFormElement {
  /**
   * Empty constructor.
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
    //==Set constraints string for the BOOLEAN element.
    this.firstElementChild.querySelector('.form-constraints').innerHTML =
      Lang.getString('boolean_constraints');

    //==Get the input field from the template.
    let booleanInput = this.firstElementChild.querySelector('input');

    //==Set the listener for the in phone preview.
    //==TODO: Preview works only for the opening hours page object.
    booleanInput.onchange = function(event) {
      //==Check the previous siblings.
      var i = 0;
      let node = booleanInput.parentNode.parentNode.parentNode;
      while ((node = node.previousSibling) != null) {
        i++;
      }
      //==Account for the header & caption.
      i = i - 4;

      //==Get the appropriate Element within the preview phone.
      let phoneElement = Phone.findActivePreviewPhone()
        .querySelectorAll('#' + booleanInput.name)[i];

      //==Set closed attribute to apply approriate CSS selector.
      phoneElement.parentNode.setAttribute('closed', booleanInput.checked);

      //==TODO: Regular behaviour.
      phoneElement.innerHTML = booleanInput.checked;
    };
    //==Loop through attributes and handle all expected BOOLEAN attributes.
    for (let key in this.attributes) {
      if (key === 'name') {
        //==Set the name attribute.
        booleanInput.setAttribute(key, this.attributes[key]);

        //==Set the placeholder text.
        this.firstElementChild.querySelector('.form-placeholder').innerHTML =
          Lang.getString(this.attributes['name']);
        //==Set the description text.
        this.firstElementChild.querySelector('.form-description').innerHTML =
          Lang.getString(this.attributes['name'] + '_' + 'description');
      }
    }
    //==Set initial data.
    if(this.data){
      booleanInput.checked = this.data;
    }else{
      console.log('NO DATA');
    }
  }
  //============================================================================
  /**
   * This method resolves the internal data fields and return an object.
   * @return {object}
   * The data entered.
   * @example
   * Structure  - {fieldName : inputBOOLEANvalue} <br>
   * Values     - {"fieldName": true}
   */
  getData() {
    //==Create the return object.
    let data = {};
    //==Get the input element.
    let booleanInput = this.firstElementChild.querySelector('input');
    //==Add inputValue to return object.
    data[booleanInput.name] = booleanInput.checked;
    return data;
  }
}
//==============================================================================
//==EOF=========================================================================
