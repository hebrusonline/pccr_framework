//==============================================================================
/**
 * @file This file contains the JSDoc Glossary.
 *
 * @author       Hebrus
 *
 * @see {@link Glossary} - The Glossary namespace.
 */
//==============================================================================

/**
 * The Glossary namespace.
 * @namespace
 */
var Glossary = {};

/**
 *<pre>
 * <b>Namespacing</b>
 * The namespace is injected via the this keyword which is static within a given execution context,
 * thus it cannot be accidentally modified at runtime.
 * </pre>
 * @see {@link https://javascriptweblog.wordpress.com/2010/12/07/namespacing-in-javascript|Namespacing in Javascript}
 */
Glossary.Namespacing;

/**
 *<pre>
 * <b>Page Type</b>
 * Definition: The type of a page object.
 * Datatype:  {@link Glossary.datatype#string|string}
 *
 * Allowed Values:
 * For basic pages: ['info', 'hours', 'admission']
 * For advanced pages: ['text', 'object', 'person', 'event', 'place']
 * </pre>
 */
Glossary.PageType;

/**
 *
 */
Glossary.Screen;

/**
 *
 */
Glossary.DOM;

/**
 *
 */
Glossary.BLOB;

/**
 *
 */
Glossary.Event;

//==============================================================================

/**
 * The datatypes used within the application.
 *@see [JavaScript Datatypes]{@link https://javascript.info/types}
 * @memberof Glossary
 */
class datatype {
  /**
   * @hideconstructor
   */
  constructor(){
    /**
     * The boolean type has only two values: true and false.
     * @see GeeksforGeeks: {@link https://www.geeksforgeeks.org/javascript-boolean/|Boolean}
     */
    this.boolean = 'A boolean value.';

    /**
     * The HTMLCollection interface represents a generic collection of {@link Glossary.datatype#HTMLElement|HTMLElement} and offers methods and properties for selecting from the list.
     * @see MDN: {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection|HTMLCollection}
     * @see w3schools: {@link https://www.w3schools.com/jsref/dom_obj_htmlcollection.asp|DOM HTMLCollection}
     */
    this.HTMLCollection = 'A HTMLCollection.';

    /**
     * The HTMLElement interface represents any HTML element.
     * @see MDN: {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement|HTMLElement}
     * @see w3schools: {@link https://www.w3schools.com/js/js_htmldom_elements.asp|HTML DOM Elements}
     */
    this.HTMLElement = 'A HTMLElement.';

    /**
     * JavaScript object values can be any datatype including a function. <br>
     * The JSON object values can only be one of the six datatypes (strings, numbers, objects, arrays, Boolean, null).
     * @see MDN: {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object|Object}
     * @see w3schools: {@link https://www.w3schools.com/js/js_objects.asp|JavaScript Objects}
     * @see medium.com: {@link https://medium.com/techtrument/javascript-object-vs-json-117965ea3dea|JavaScript Object vs JSON}
     */
    this.object = 'An object.';

    /**
     * The Promise object represents the eventual completion (or failure) of an asynchronous operation, and its resulting value.
     * @see MDN: {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise|Promise}
     * @see w3schools: {@link https://www.w3schools.com/js/js_es6.asp|ECMAScript 6}
     */
    this.Promise = 'A Promise.';

    /**
     * A string in JavaScript must be surrounded by quotes.
     * @see Paranoid Coding: {@link https://blog.paranoidcoding.com/2019/04/08/string-vs-String-is-not-about-style.html|String vs. string}
     * @see MDN: {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String|String}
     * @see w3schools: {@link https://www.w3schools.com/jsref/jsref_obj_string.asp|JavaScript Strings}
     */
    this.string = 'A string.';
  }
}
