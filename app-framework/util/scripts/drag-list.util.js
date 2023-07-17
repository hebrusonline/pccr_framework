//==============================================================================
/**
 * @file This file contains functions related to the drag list.
 *
 * <pre>
 *
*==Method List:================================================================= <br>
* | Name              | Description                                               |
* ----------------    | --------------------------------------------------------- |
* | [handleDragEnd]{@link Drag.handleDragEnd}     | The handleDragEnd event.                                  |
* | [handleDragEnter]{@link Drag.handleDragEnter}   | The handleDragEnter event.                                |
* | [handleDragLeave]{@link Drag.handleDragLeave}   | The handleDragLeave event.                                |
* | [handleDragOver]{@link Drag.handleDragOver}    | The handleDragOver event.                                 |
* | [handleDragStart]{@link Drag.handleDragStart}   | The handleDragStart event.                                |
* | [handleDrop]{@link Drag.handleDrop}        | The handleDrop event.                                     |
* | [makeNewOrderIds]{@link Drag.makeNewOrderIds}   | Create new order IDs.                                     |
* | [reOrder]{@link Drag.reOrder}           | Reorder the list according to the list item IDs.          |
* | [updateAppPageList]{@link Drag.updateAppPageList} | Function to setup draggable list items.                   |
* </pre>
 * @author       Simon Cozen
 * @author       Hebrus
 *
 * @see {@link Drag} - The Drag namespace.
 *
 * @see woolfool: {@link http://www.woolfool.net/sandbox/draganddrop.html|Drag & Drop Sortable Lists with JavaScript and CSS}
 * @see Codepen: {@link https://codepad.co/snippet/sortable-list-with-drag-and-drop|Sortable List with Drag and Drop}
 * @see Codereview: {@link https://codereview.stackexchange.com/questions/127271/javascript-drag-and-drop-sortable-list|JavaScript drag-and-drop sortable list}
 * @see htmll5rocks: {@link http://www.html5rocks.com/en/tutorials/dnd/basics/|Native HTML5 Drag and Drop}
 */
//==============================================================================

/**
* The Drag namespace.
* @namespace
*/
var Drag = {};

//==Namespacing construct.
(function() {
  //==The current list items.
  let listItems = {};

  //==The drag source element.
  let dragSrcEl = null;

  //==============================================================================
  /**
  * The handleDragEnd event.
  *
  * @param {Event} e - An event.
  *
  * @memberof Drag
  * @private
  */
  let handleDragEnd =
    function(e) {

      for (i = 0; i < listItems.length; i++) {
        listItem = listItems[i];
        listItem.classList.remove('over');
      }
      dragSrcEl.classList.remove('dragStartClass');
    };

  //==============================================================================
  /**
  * The handleDragEnter event.
  *
  * @param {Event} e - An event.
  *
  * @memberof Drag
  * @private
  */
  let handleDragEnter =
    function(e) {

      for(let i=0; i < listItems.length; i++){
        if( listItems[i].getAttribute('order-id') != this.getAttribute('order-id')){
          listItems[i].classList.remove('over');
        }
      }
      this.classList.add('over');
    };

  //==============================================================================
  /**
  * The handleDragLeave event.
  *
  * @param {Event} e - An event.
  *
  * @memberof Drag
  * @private
  */
  let handleDragLeave =
    function(e) {};

  //==============================================================================
  /**
  * The handleDragOver event.
  *
  * @param {Event} e - An event.
  *
  * @return {boolean} false
  *
  * @memberof Drag
  * @private
  */
  let handleDragOver =
    function(e) {
      e.preventDefault();
      return false;
    };

  //==============================================================================
  /**
  * The handleDragStart event.
  *
  * @param {Event} e - An event.
  *
  * @memberof Drag
  * @private
  */
  let handleDragStart =
    function(e) {
      this.className += ' dragStartClass';
      dragSrcEl = this;

      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', this.innerHTML);
    };

  //==============================================================================
  /**
  * The handleDrop event.
  *
  * @param {Event} e - An event.
  *
  * @return {boolean} false
  *
  * @memberof Drag
  * @private
  */
  let handleDrop =
    function(e) {
      var listItems = document.querySelectorAll('.page--item');
      //==Stop the browser from redirecting.
      e.stopPropagation();
      dragSrcOrderId = parseInt(dragSrcEl.getAttribute('order-id'));
      dragTargetOrderId = parseInt(this.getAttribute('order-id'));
      var tempThis = this;

      /**
      * Don't do anything if dropping the same column we're dragging.
      * and check if only one difference and then do not execute
      */
      if (dragSrcEl != this) {
        //--Set the source column's HTML to the HTML of the column we dropped on.
        tempThis = this;

        makeNewOrderIds(tempThis);

        dragSrcEl.classList.remove('dragStartClass');

        reOrder(listItems);
      } else {
        dragSrcEl.classList.remove('dragStartClass');
        return false;
      }
    };

  //==============================================================================
  /**
  * Create new order IDs.
  *
  * @param {Event} tempThis - An event.
  *
  * @memberof Drag
  * @private
  */
  let makeNewOrderIds =
    function(tempThis) {
      // Check if up or down movement
      //==reset list items
      var listItems = document.querySelectorAll('.page--item');

      //  Find divs between old and new location and set new ids - different in up or down movement (if else)
      if (dragSrcOrderId < dragTargetOrderId) {
        for (let i = dragSrcOrderId ; i <= dragTargetOrderId ; i++) {
          listItems[i].setAttribute('order-id', i - 1);
          // Set new id src
          dragSrcEl.setAttribute('order-id', dragTargetOrderId);
        }
      } else {
        for (let i = dragSrcOrderId ; i >= dragTargetOrderId; i--) {
          listItems[i].setAttribute('order-id', i + 1);
          // Set new id src
          dragSrcEl.setAttribute('order-id', dragTargetOrderId);
        }
      }
      let v = 0;
      while (v != listItems.length){
        v++;
      }
    };

  //==============================================================================
  /**
  * Reorder the list according to the list item IDs.
  *
  * @param {Event} listItems - An event.
  *
  * @memberof Drag
  * @private
  */
  let reOrder =
    function(listItems) {
      var tempListItems = listItems;
      tempListItems = Array.prototype.slice.call(tempListItems, 0);

      tempListItems.sort(function(a, b) {
        return a.getAttribute('order-id') - b.getAttribute('order-id');
      });

      var parent = document.getElementById('page-list');
      parent.innerHTML = '';

      for (var i = 0, l = tempListItems.length; i < l; i++) {
        parent.appendChild(tempListItems[i]);
        //==reset order ID
        tempListItems[i].setAttribute('order-id', i);
      }
    };

  //==============================================================================
  /**
  *  Function to setup draggable list items.
  *
  * @memberof Drag
  */
  let updateAppPageList =
    function(){

      listItems = document.querySelectorAll('.page--item');

      for (i = 0; i < listItems.length; i++) {
        listItem = listItems[i];

        listItem.setAttribute('order-id', i);

        //==Add all drag relevant listeners.
        listItem.addEventListener('dragstart', handleDragStart, false);
        listItem.addEventListener('dragenter', handleDragEnter,{capture: true});
        listItem.addEventListener('dragover', handleDragOver, false);
        listItem.addEventListener('dragleave', handleDragLeave,{capture: true});
        listItem.addEventListener('drop', handleDrop, false);
        listItem.addEventListener('dragend', handleDragEnd, false);
      }
    };
  //============================================================================
  this.updateAppPageList = updateAppPageList;
  //============================================================================
}).apply(Drag);
//==============================================================================
//==EOF=========================================================================
