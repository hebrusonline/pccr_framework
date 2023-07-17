//==============================================================================
/**
 * @file This File contains definitions concered with the AreaEditor namespace.
 * <pre>
 *
 *==Method List:================================================================= <br>
 * | Name                     | Description                                               |
 * -------------------------- | --------------------------------------------------------- |
 * | [assembleRoom]{@link AreaEditor.assembleRoom}             | Function to assemble a room from the given data.          |
 * | [changeMarker]{@link AreaEditor.changeMarker}             | Function to change the marker type.                       |
 * | [clearGrid]{@link AreaEditor.clearGrid}                | Function to reset the room editor grid.                   |
 * | [commitRoom]{@link AreaEditor.commitRoom}               | Function to save a room page to the data base.            |
 * | [createGrid]{@link AreaEditor.createGrid}               | Function to create a room editor grid.                    |
 * | [roomSelect]{@link AreaEditor.roomSelect}               | Function to set the chosen marker to the selected grid element.|
 * </pre>
 * @author       Hebrus
 *
 * @see {@link AreaEditor} - The AreaEditor namespace.
 */

//==============================================================================
/**
 * The AreaEditor namespace.
 * @namespace
 */
let AreaEditor = {};

//==Namespacing construct.
(function() {
  //==Set the default marker.
  let border_color = 'wall';
  this.object_number = 1;
  this.free_number = [];
  //============================================================================
  /**
   * Function to assamble a room from the given data.                       <br>
   *                                                                        <br>
   * @param {Object} data - The room data object.
   * @param {number} size - The room size.
   *
   * @return {HTMLElement} An element containing the room grid.
   *
   * @memberof AreaEditor
   */
  let assembleRoom =
    function(data, size){
      console.log(data, size);

      //==Create container element.
      let areaBox = document.createElement('div');

      //==Crete the room grid by looping through the grid size.
      for(let row = 0; row < size; row ++){
        //--Create grid row.
        let areaRow = document.createElement('div');
        areaRow.classList.add('room_row');
        //--Create room blocks and add available markers.
        for(let col = 0; col < size; col ++){
          let block = document.createElement('div');
          block.classList.add('room_block');
          if (data[(row*size) + col]) {
            let string = data[(row*size) + col];
            if(string.includes('object') || string.includes('poi')){

              if (string.includes('object')) {
                console.log(string);
                block.innerHTML = string.replace('object', '');
                console.log(block.innerHTML);
                console.log(string);
                console.log(string.replace(block.innerHTML, ''));
                block.classList.add(string.replace(block.innerHTML, ''));
              }

              if (string.includes('poi')) {
                console.log(string);
                block.innerHTML = string.replace('poi', '');
                console.log(block.innerHTML);
                console.log(string);
                console.log(string.replace(block.innerHTML, ''));
                block.classList.add(string.replace(block.innerHTML, ''));
              }
            }else {
              block.classList.add(string);
            }
          }

          areaRow.appendChild(block);
        }
        areaBox.appendChild(areaRow);
      }

      return areaBox;
    };

  //============================================================================
  /**
   * Function to change the marker type.                                    <br>
   *                                                                        <br>
   * @param {string} marker - The identifier for the marker type.
   *
   * @memberof AreaEditor
   */
  let changeMarker =
    function(marker) {
      //==Check for the marker identifier.
      if (marker === 'door') {
        border_color = 'door';
      }
      if (marker === 'wall') {
        border_color = 'wall';
      }
      if (marker === 'object') {
        border_color = 'object';
      }
      if (marker === 'trail') {
        border_color = 'trail';
      }
      if (marker === 'lawn') {
        border_color = 'lawn';
      }
      if (marker === 'poi') {
        border_color = 'poi';
      }
    };

  //============================================================================
  /**
   * Function to reset the room editor grid.                                <br>
   *                                                                        <br>
   * @memberof AreaEditor
   */
  let clearGrid =
    function(){
      //==Reset the editor pane.
      document.querySelector(
        '#area-editor-box #area-editor-pane'
      ).innerHTML = '';

      //==Reset the input fields.
      document.querySelector('#area-editor-box #area_grid_size').value = '';
      document.querySelector('#area-editor-box #area_grid_name').value = '';

      //==Manage control buttons.
      document.querySelector(
        '#area-editor-box #area_create_btn'
      ).classList.remove('hidden');
      document.querySelector(
        '#area-editor-box #area_clear_btn'
      ).classList.add('hidden');

      this.object_number = 1;
    };

  //============================================================================
  /**
   * Function to save a room page to the data base.                         <br>
   *                                                                        <br>
   * @memberof AreaEditor
   */
  let commitRoom =
    function() {
      //==Get the room name.
      let room_name = document.querySelector(
        '#area-editor-box #area_grid_name'
      ).value;

      //==Check for valid name.
      if(room_name != ''){
        //--Get the room blocks.
        let blocks = document.querySelector(
          '#area-editor-box #area-editor-pane'
        ).querySelectorAll('.room_block');

        //--Save the marked blocks.
        let marked_blocks = {};
        for (let i = 0; i < blocks.length; i++) {
          if (blocks[i].classList.item(2)) {
            marked_blocks[i] = blocks[i].classList.item(2);
            if(blocks[i].classList.item(2) === 'object'
            || blocks[i].classList.item(2) === 'poi'){
              marked_blocks[i] = marked_blocks[i] + blocks[i].innerHTML;
            }
          }
        }

        //==Assamble the room data object.
        let room_data = {};

        room_data.blocks = marked_blocks;

        room_data.size = Math.sqrt(blocks.length);
        room_data.name = room_name;
        room_data.layout = document.querySelector('#area-editor-box #room_type')
          .getAttribute('type');

        let data = {type: 'room', data: room_data};
        console.log(data);

        //==Save the room data object.
        Data.validateJSON(data);

        //== Navigate back
        // Click.backTargetHandler(__BACK_TARGET);

        //==Reset the editor grid.
        clearGrid();

      }else{
        alert(langJSON.util.error.invalid_room_name);
      }
    };

  //============================================================================
  /**
   * Function to create a room editor grid.                                 <br>
   *
   * @memberof AreaEditor
   */
  let createGrid =
    function(){
      //==Get editor pane.
      let gridPane = document.querySelector(
        '#area-editor-box #area-editor-pane'
      );
      //--Reset the editor pane.
      gridPane.innerHTML = '';

      //==Get the grid size.
      let roomsize = document.querySelector(
        '#area-editor-box #area_grid_size'
      ).value;

      //==Check if grid size is in bounds.
      if(roomsize > 4 && roomsize <11){
        //--Create the grid by looping the squared dimensions.
        for (let i = 0; i < roomsize; i++) {
          let room_row = document.createElement('div');
          room_row.classList.add('room_row');
          for (let j = 0; j < roomsize; j++) {
            let room_block = document.createElement('div');
            //-Add attributes to room block.
            room_block.classList.add((i + 1) * (j + 1));
            room_block.classList.add('room_block');
            //-Add room block to row.
            room_row.appendChild(room_block);
          }
          //--Add row to grid.
          gridPane.appendChild(room_row);
        }
        //==Add the click listener.
        gridPane.onclick = function(){
          roomSelect(event);
        };

        //==Manage control buttons.
        document.querySelector('#area_create_btn').classList.add('hidden');
        document.querySelector('#area_clear_btn').classList.remove('hidden');
      }else{
        alert(langJSON.util.error.invalid_room_size);
      }
    };

  //============================================================================
  /**
   * Function to set the chosen marker to the selected grid element.        <br>
   *                                                                        <br>
   * @param {Event} event - The click event calling the function.
   *
   * @memberof AreaEditor
   * @private
   */
  let roomSelect =
    function(event) {
      //==Check issuing element.
      if (event.target.classList.contains('room_block')) {
        //--If marker has been assigned already: remove marker.
        if (event.target.classList.item(2)) {
          if (event.target.classList.item(2) === 'object'
          || event.target.classList.item(2) ==='poi') {
            AreaEditor.free_number.push(parseInt(event.target.innerHTML));
            console.log(AreaEditor.free_number);
          }
          event.target.classList.remove(event.target.classList.item(2));
          event.target.innerHTML = '';
        } else {
          //--Add marker.
          event.target.classList.add(border_color);
          if(border_color === 'object' || border_color === 'poi'){

            if (AreaEditor.free_number[0]) {
              event.target.innerHTML = Math.min.apply(null, AreaEditor.free_number);
              AreaEditor.free_number
                .splice(AreaEditor.free_number
                  .indexOf(Math.min.apply(null, AreaEditor.free_number)), 1);
            }else{
              event.target.innerHTML = AreaEditor.object_number;
              AreaEditor.object_number += 1;
            }

          }
        }
      }
    };

  //============================================================================
  this.assembleRoom = assembleRoom; //--Called 1 in: preview-phone.class.js
  this.changeMarker = changeMarker; //--Called 6 in: home.html (BUTTON)
  this.clearGrid = clearGrid;       //--Called 1 in: home.html (BUTTON)
  this.commitRoom = commitRoom;     //--Called 1 in: home.html (BUTTON)
  this.createGrid = createGrid;     //--Called 1 in: home.html (BUTTON)

  //============================================================================
}).apply(AreaEditor);
//==============================================================================
//==EOF=========================================================================
