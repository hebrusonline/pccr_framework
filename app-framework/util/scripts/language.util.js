//==============================================================================
/**
 * @file This file contains language utility functions.
 *
 * <pre>
 *
*==Method List:================================================================================================= <br>
* | Name             | Description                                                                               |
* ----------------   | ----------------------------------------------------------------------------------------- |
* | [getJSON]{@link Lang.getJSON}          | Function to get the JSON file corresponding to the desired language and location.         |
* | [getString]{@link Lang.getString}        | Function to get a string in the selected language for given type.                         |
* | [lookForObjectKey]{@link Lang.lookForObjectKey} | Function to look for an object within an object by the given key.                         |
* | [lookForStringKey]{@link Lang.lookForStringKey} | Function to look for a string within an object by a certain key.                          |
* | [setLables]{@link Lang.setLables}        | Function to initialize the UI labels using the values of '/util/data/lang/[__LANG].json'. |
* </pre>
* @author       Hebrus
*
* @see {@link Lang} - The Lang namespace.
*/
//==============================================================================

/**
 * The Lang namespace.
 * @namespace
 */
var Lang = {};

/**
 * Global language JSON object.
 */
let langJSON = {};

(function() {
  //============================================================================
  /**
   * Function to get the JSON file corresponding to the desired language and location.
   *
   * @param {string} location - A URI {@link Glossary.datatype#string|string}.
   * @param {string} [language= {@link Lang.__LANG}] - The abbreviation for the language.
   *
   * @memberof Lang
   */
  let getJSON =
    async function(location, language = Lang.__LANG) {

      let promises = [];
      promises.push(Data.getFile(location + '/data/lang/', language, 'json'));
      await Promise.all(promises).then(function() {
        //==Add result to global object langJSON.
        langJSON[location] = arguments[0][0];
      });
    };

  //============================================================================
  /**
   * Function to get a string in the selected language for given type.
   *
   * @param {string} string - A key {@link Glossary.datatype#string|string} identifying the desired language string.
   * @param {string} [type] - A type {@link Glossary.datatype#string|string} identifying special content.
   *
   * @return {string} The expected {@link Glossary.datatype#string|string} value.
   *
   * @memberof Lang
   */
  let getString =
    function(string, type) {
      if (type === 'PAGE-CARD') {
        //--Get the whole JSON for describing the card of the string target.<br>
        //-Uses the values stored in '/cards/data/lang/[__LANG].json'
        return lookForObjectKey(langJSON['cards'], string);
      } else
        //--Get the actual string requested.
        //-Uses the values stored in '/forms/data/lang/[__LANG].json'
        return lookForStringKey(langJSON['forms'], string);
    };

  //============================================================================
  /**
   * Function to look for an object within an object by the given key.
   *
   * @param {Object} object - An {@link Glossary.datatype#object|object}.
   * @param {string} lookupKey - A key {@link Glossary.datatype#string|string}.
   *
   * @return {Object} The desired {@link Glossary.datatype#object|object}.
   *
   * @memberof Lang
   * @access private
   */
  let lookForObjectKey =
    function(object, lookupKey) {
      for (let key in object) {
        if (key === lookupKey) {
          return object[lookupKey];
        }
      }
      return lookupKey;
    };

  //============================================================================
  /**
   * Function to look for a string within an object by a certain key.
   *
   * @param {Object} object - An {@link Glossary.datatype#object|object} containing language strings.
   * @param {string} lookupKey - A key string identifying the desired {@link Glossary.datatype#string|string}.
   *
   * @return {string} The desired value {@link Glossary.datatype#string|string}.
   *
   * @memberof Lang
   * @access private
   */
  let lookForStringKey =
    function(object, lookupKey) {
      let returnValue = false;
      for (let key in object) {
        if (typeof(object[key]) === 'object') {

          returnValue = lookForStringKey(object[key], lookupKey);

          if (typeof(returnValue) === 'string') {

            return returnValue;
          }
        } else if (key === lookupKey) {
          returnValue = object[lookupKey];
          return returnValue;
        }
      }
      return returnValue;
    };

  //============================================================================
  /**
   * Function to initialize the UI labels using the values of '/util/data/lang/[__LANG].json'.
   *
   * @memberof Lang
   */
  let setLables =
    function() {
      //==Get all label containers.
      let strings = document.querySelectorAll('.__string');
      //==Look up the corresponding string in the user's languange.
      for (let index = 0; index < strings.length; index++) {
        let key = strings[index].id.split('-')[1];
        strings[index].innerHTML = langJSON['util'].lables[key];
      }
    };
  //============================================================================

  //==Make public functions available on the namespace Object.
  this.getJSON = getJSON;
  this.getString = getString;
  this.setLables = setLables;

  /**
   * The selected user language ['de' or 'en'].
   * @memberof Lang
   */
  this.__LANG = '';
  //============================================================================
}).apply(Lang);
//==============================================================================
//==EOF=========================================================================
