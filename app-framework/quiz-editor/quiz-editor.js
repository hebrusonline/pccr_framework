//==============================================================================
/**
 * @file This file contains definitions of the QuizEditor namespace.
 *
 * <pre>
 *
*==Method List:================================================================= <br>
* | Name           | Description                                               |
* ---------------- | --------------------------------------------------------- |
* | [addPreview]{@link QuizEditor.addPreview}     | Function to add the question to the question preview pane.|
* | [addQuestion]{@link QuizEditor.addQuestion}    | Function to create and show the question form.            |
* | [changeQuestion]{@link QuizEditor.changeQuestion} | Function to show the question grid.                       |
* | [commitQuiz]{@link QuizEditor.commitQuiz}     | Function to save the quiz documet to the database.        |
* ==============================================================================
*
* </pre>
* @author       Hebrus
* @see {@link QuizEditor} - The QuizEditor namespace.
*/
/**
 * The QuizEditor namespace.
 * @namespace
 */
var QuizEditor = {};

//==Namespacing construct.
(function() {
  //============================================================================
  /**
   * Function to add a question to the question preview pane.
   *
   * @param {Object} data - The data of the question page.
   * @param {string} id - The id of the question page.
   *
   * @memberof QuizEditor
   */
  let addPreview =
    function(data, id){
      //==Get the container.
      let container = document.querySelector(
        '#quiz-editor-box .editor-preview'
      );
      //==Create the preview box.
      let box = document.createElement('div');
      let inner = '';
      //--Add appropriate layout.
      if(data.layout === 'text'){
        inner =
        `<div id="quiz__question">${data.question}</div>
        <div id="quiz__answers">
        <div class="right">${data.right}</div>
        <div class="wrong">${data.false_1}</div>
        <div class="wrong">${data.false_2}</div>
        <div class="wrong">${data.false_3}</div>
        </div>
        `;
      }else if(data.layout === 'image'){
        //==Get the question image.
        var storageRef = firebase.storage().ref();
        var imageRef = storageRef.child(data.image.image_path);
        imageRef.getDownloadURL().then(function(url) {
          //--Add image to layout.
          box.querySelector('#full-image').src = url;

        }.bind(box)).catch(function(error) {
          console.log(error);
        });

        inner =
        `<div id="quiz__question">${data.question}</div>
        <div id="quiz__image">
          <img id="full-image" src="" alt="IMAGE"/>
        </div>
        <div id="quiz__answers">
        <div class="right">${data.right}</div>
        <div class="wrong">${data.false_1}</div>
        <div class="wrong">${data.false_2}</div>
        <div class="wrong">${data.false_3}</div>
        </div>
        `;
      }
      //==Set attributes.
      box.page_id = id;
      box.language = data.language;
      box.classList.add('quiz_box');
      box.innerHTML = inner;

      //==Add box to container.
      container.appendChild(box);

      //==Reset form container.
      UI.hideElement('#quiz-editor-box #form-container');
      UI.resetElementText('#quiz-editor-box #form-container');
    };

  //============================================================================
  /**
   * Function to create and show the question form.
   *
   * @param {string} type - The question type ['text' or 'image'].
   * @param {Object} data - The question data for changes.
   *
   * @memberof QuizEditor
   */
  let addQuestion =
    function(type, data){
      let container = document.querySelector(
        '#quiz-editor-pane #form-container'
      );

      UI.createForm('question/'+type+'.layout', container, data);

      UI.showElement('#quiz-editor-pane #form-container');
    };

  //============================================================================
  /**
   * Function to show the question grid.
   *
   * @param {string} type - The question type ['text' or 'image'].
   * @param {Object} data - The question data for changes.
   *
   * @memberof QuizEditor
   */
  let changeQuestion=
  function(){
    UI.resetElementText('#quiz-editor-pane #grid-container');
    UI.showElement('#quiz-editor-pane #grid-container');

    //==Diasable 'CREATE' buttons.
    let buttons =
      document.querySelectorAll(
        '#quiz-editor-box .editor-controls .editor-controls__item'
      )[0].querySelectorAll('button');

    for(button of buttons){
      button.classList.add('inactiveBtn');
      button.disabled = true;
    }

    let container = document.querySelector('#quiz-editor-pane #grid-container');
    Cards.assambleGrid('question', container);
  };

  //============================================================================
  /**
   * Function to save the quiz document to the database.
   *
   * @memberof QuizEditor
   */
  let commitQuiz =
    function(){
      //==Get the question preview boxes.
      let pane = document.querySelector('#quiz-editor-box');
      let questions = pane.querySelectorAll('.quiz_box');

      //==Get the quiz name.
      let nameInput = pane.querySelector('._quiz-name');
      let name = nameInput.value;
      //--Check if name length is appropriate.
      if (
        name.length >= nameInput.getAttribute('minlength')
        && name.length <= nameInput.getAttribute('maxlength')
      ){
        let newQuiz = {};
        newQuiz.name = name;

        //==Check if at least one question was added.
        if (questions.length > 0) {
          let questionIds = [];

          //--Get the question IDs.
          for(let question of questions){
            questionIds.push(question.page_id);
          }
          newQuiz.questions = questionIds;
          newQuiz.layout = 'basic';
          newQuiz.language = questions[0].language;

          //--Prepare the data object containing the document.
          let data = {'type':'quiz', 'data': newQuiz};

          //--Validate the document.
          if (Data.validateJSON(data)) {
            Data.commitPageData(data);
            _DATA_ERROR = false;
          } else {
            __DATA_ERROR = true;
            console.log('A data error occured!');
          }

          //==Reset quiz editor.
          UI.hideElement('#quiz-editor-box #form-container');
          UI.resetElementText('#quiz-editor-box #form-container');
          UI.resetElementText('#quiz-editor-box .editor-preview');
        }else{
          alert(langJSON.util.error.missing_question);
        }
      }else{
        alert(langJSON.util.error.invalid_quiz_name);
      }
    };
  //============================================================================

  //==Make public functions available on the namespace Object.
  this.addPreview = addPreview;
  this.addQuestion = addQuestion;
  this.changeQuestion = changeQuestion;
  this.commitQuiz = commitQuiz;
  //============================================================================
}).apply(QuizEditor);
//==============================================================================
//==EOF=========================================================================
