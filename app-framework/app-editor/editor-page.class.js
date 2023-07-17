//==============================================================================
/**
 * @file This File contains definitions concerned with the EditorPage class.
 *
 * @author       Hebrus
 *
 * @see {@link AppEditor.EditorPage} - The Data namespace.
 */
//==============================================================================
/**
 * Class representing an EditorPage element. <br>
 * @extends HTMLElement
 *
 * @memberof AppEditor
 */

class EditorPage extends HTMLElement {
  /**
   *Empty constructor.
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   * Initialize the element by setting its template.
   */
  initElement() {
    this.setTemplate();
  }

  /**
   * Set the element's template.
   */
  setTemplate() {
    let promises = [];
    //==Create promise for template html file.
    promises
      .push(Data.getFile('app-editor/', 'editor-page.template', 'html'));
    //==Resolve promises made above.
    Promise.all(promises).then(function() {
      //==Add template structure to this.
      this.appendChild(arguments[0][0][0]);
      // DragElement(this);

      //==Bind this context.
    }.bind(this));
  }

  /**
   * Adds a page to the editor page container.
   *
   * @param {string} pageID - The ID of the page to be added.
   * @param {string} type - The type of the page to be added.
   */
  addPage(pageID, type) {
    console.log('ID:', pageID);

    //==Get the page's data.
    var database = firebase.firestore();
    database
      .collection(firebase.auth().currentUser.uid)
      .doc('pages')
      .collection(type)
      .doc(pageID)
      .get()
      .then(function(doc) {
        if (doc.exists) {
          let data = doc.data();
          data.id = pageID;
          console.log('Document data:', data);
          if (type === 'appmeta') {
            //--Set the Apps language and content type.
            AppEditor.language = data.language;
            AppEditor.content = data.content;
          }

          let phoneData = {};
          phoneData.data = data;

          //TODO: prettify?
          phoneData.type = doc._key.path.segments[2];

          //==Create new preview phone lement.
          let newPhone = document.createElement('preview-phone');
          let layout = type + '/' + 'basic';

          let screenX = this.querySelector('.small-screen');

          newPhone.initElement(data, layout.split('.')[0], screenX);

          Phone.setPhoneAttributes(
            screenX,
            pageID,
            layout.split('/')[0],
            layout.split('/')[1]
          );
        } else {
          console.log('No such document!');
        }
      }.bind(this));
  }

  /**
   *  Arrange the element in the center of its parent.
   *
   * @param {HTMLElement} parent - The parent element.
   */
  center(parent) {
    this.style.left = (parent.clientWidth / 2) - this.clientWidth / 2 + 'px';
    this.style.top = (parent.clientHeight / 2) - this.clientHeight / 2 + 'px';
  }

  /**
   *  Arrange the element for the cube editor (bottom right).
   *
   * @param {HTMLElement} parent - The parent element.
   */
  cube(parent) {
    this.style.left = (parent.clientWidth / 3) - this.clientWidth / 3 + 'px';
    this.style.top = (parent.clientHeight / 2) - this.clientHeight / 2 + 'px';
  }

  /**
   *  Arrange the element in the top center of its parent.
   *
   * @param {HTMLElement} parent - The parent element.
   */
  centerTop(parent) {
    this.style.left = (parent.clientWidth / 2) - this.clientWidth / 2 + 'px';
    this.style.top = (parent.clientHeight / 2) - this.clientHeight * 6 / 5 + 'px';
  }

  /**
   *  Arrange the element in the bottom center of its parent.
   *
   * @param {HTMLElement} parent - The parent element.
   */
  centerBottom(parent) {
    this.style.left = (parent.clientWidth / 2) - this.clientWidth / 2 + 'px';
    this.style.top = (parent.clientHeight / 2) + this.clientHeight * .5 / 5 + 'px';
  }

  /**
   *  Arrange the element in the bottom left of its parent.
   *
   * @param {HTMLElement} parent - The parent element.
   */
  leftBottom(parent) {
    this.style.left = (parent.clientWidth / 2) - this.clientWidth * 2 + 'px';
    this.style.top = (parent.clientHeight / 2) + this.clientHeight * .5 / 5 + 'px';
  }

  /**
   *  Arrange the element in the bottom right of its parent.
   *
   * @param {HTMLElement} parent - The parent element.
   */
  rightBottom(parent) {
    this.style.left = (parent.clientWidth / 2) + this.clientWidth + 'px';
    this.style.top = (parent.clientHeight / 2) + this.clientHeight * .5 / 5 + 'px';
  }

  /**
   * Attaches a button to the element.
   *
   * @param {string} side - The side to attach the button to.
   * @param {string} target - The target page type target.
   */
  attachButton(side, target) {
    //==Create a new button.
    let button = document.createElement('button');
    button.classList.add('createCubePageButton', 'btn');
    //--Add the icon to the button.
    button.innerHTML =  UI.createIconBox(target).innerHTML;
    //--Add the button th the element.
    this.appendChild(button);

    //==Position button at specified side.
    if (side == 'top') {
      button.style.marginTop = -button.clientHeight + 'px';
      button.style.marginLeft = this.clientWidth / 2 - button.clientWidth / 2 + 'px';
    }
    if (side == 'bottom') {
      button.style.marginTop = this.clientHeight + 'px';
      button.style.marginLeft = this.clientWidth / 2 - button.clientWidth / 2 + 'px';
    }

    if (side == 'behind') {
      button.style.marginTop = this.clientHeight - button.clientHeight + 'px';
      button.style.marginLeft = this.clientWidth - button.clientWidth + 'px';
    }

    //==Add click listener to the button.
    button.onclick = function(e) {
      console.log('Target:', target);
      //--Check target.
      if (target) {
        //-Show appropriate selection pane.
        if (
          ['info', 'hours', 'admission'].includes(target)) {

          let area = document.querySelector(
            '#app-editor-box #page-select-popup'
          );

          area.classList.remove('hidden');

          area.querySelector('.btn_close_app_popup').onclick = function() {
            area.classList.add('hidden');
            area.querySelector('.select-popup-grid').classList.add('hidden');
            area.querySelector('.select-popup-grid').innerHTML = '';
          };

          AppEditor.createEditorGrid(target);
        } else if (target === 'bottom') {
          console.log('Add Related Pages');
          AppEditor.showAppEditorSelectorPane('cubesingle');
        } else if (target === 'behind') {
          console.log('Add Multi-Media Page');
          AppEditor.showAppEditorSelectorPane('media');
        } else if (target === 'top') {
          console.log('Interact');
          AppEditor.showAppEditorSelectorPane('interact');
        }
      } else {
        console.log('No target selected!');
      }
    };
  }
}
//==============================================================================
//==EOF=========================================================================
