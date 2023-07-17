//==============================================================================
/**
 * @file This file contains definitions concerned with the BasicFormElement class.
 *
 * @author       Hebrus
 *
 * @see {@link Inputs} - The Inputs namespace.
 */
//==============================================================================
/**
 * The Inputs namespace.
 * @namespace
 */
var Inputs = {};
//CLASS
/**
 * @classdesc
 * Class representing a BasicFormElement. <br>
 * This is the most basic structure any form element must be built upon.
 *
 * @extends HTMLElement
 * @memberof Inputs
 */

class BasicFormElement extends HTMLElement {
  /**
   * Empty constructor.
   * @constructor
   */
  constructor() {
    super();
  }
  //============================================================================
  //==SETTER & GETTER===========================================================
  /**
   * Setter for the 'attributes' object of the element.
   * @param {object} attributes - The attributes object.
   */
  set attributes(attributes) {
    this._attributes = attributes;
  }
  /**
   * Getter for the 'attributes' object of the element.
   * @type {object}
   */
  get attributes() {
    return this._attributes;
  }
  /**
   * Setter for the template of the element.
   * @param {NodeList} templates - The template NodeList.
   */
  set templates(templates) {
    this._templates = templates;
  }
  /**
   * Getter for the template NodeList.
   * @type {NodeList}
   */
  get templates() {
    return this._templates;
  }
  //============================================================================
  /**
   * This method sets the element's attributes and
   * sets the element's template to initialize the element.
   * @param {object} properties - The element's properties.
   * @param {object} data - The element's existing data (to insert for change).
   */
  initElement(properties, data) {
    //==Set the attributes.
    this.attributes = properties;
    console.log(data);
    this.data = data;
    //==Initialize element template.
    this.setTemplate();
  }

  /**
   * This method must initialize the element's attributes.
   * <br>
   * Overwrite for specific element use case.
   * @abstract
   */
  initAttributes() {
    //@warning: prompt warnning message!
    console.warn('The used element is not defined: ');
    console.log(this.attributes);
  }

  /**
   * This method must return the element's data according to its schema.
   * <br>
   * Overwrite for specific input use case.
   * @return {object} Empty object.
   * @abstract
   */
  getData() {
    //@warning: warnning message!
    console.warn('The desired class has no getData function.');
    return {};
  }

  /**
   * This method sets the template that fits the constructor's name. <br>
   * Then call the specific implementation of the
   * [initAttributes]{@link BasicFormElement#initAttributes} method.
   */
  setTemplate() {
    //==Setup promise.
    let promises = [];
    promises
      .push(Data.getFile('forms/templates/', this.tagName, 'html'));

    //==Resolve promises.
    Promise.all(promises).then(function() {
      //==Get the first container within the template.
      console.log(this.constructor.name);
      //==Set the template.
      this.templates = arguments[0][0][0].firstElementChild;
      //==Pin the template to the element.
      this.appendChild(this.templates);
      //==Initialize the available attributes.
      this.initAttributes();
      //==Bind the element itself to connect the template on callback.
    }.bind(this));
  }

  /**
   * This method returns weather an input element representation
   * is located within an array or not.
   * @param {HTMLElement} target - The element's HTML representation.
   * @return {string} The arrayId as string representation,
   * IF empty element is NOT in an array.
   */
  inArray(target) {
    let isInArray = '';
    let arrayId = target.parentNode.parentNode.parentNode
      .getAttribute('__arrayid');
    if (arrayId && arrayId != 0) {
      isInArray = target.parentNode.parentNode.parentNode
        .getAttribute('__arrayid');
    }
    return isInArray;
  }
}

//==============================================================================
//==EOF=========================================================================
