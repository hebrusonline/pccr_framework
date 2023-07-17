<section>

# Styleguide <br> for the PCCR App Framework

This document defines the concepts and the central visual elements of the user interface of the PCCR App Framework.<br>

## Content
To start the following concepts are highlighted to grasp the overall approach:

* [Model-View-ViewModel](#mvvm): The underlying approach based on the Model-View-ViewModel (MVVM) design pattern.
* [Interface Elements](#interface) : The setup of the three most elementary view elements: card, input, screen.
* [App Page Data Model](#datamodel) : The model for app pages that enables the definition of content to be displayed on a screen.
* The documentation for the UI Logic, the Navigation Services, and Business and Validation Logic is accessible in the [technical documentation](../documentation).

The following chapters contain further information for the recurring interface elements of the PCCR App Framework:

* <a href="/styleguide/section-Card.html">Card</a>
* <a href="/styleguide/section-editor.html">Editor</a>
* <a href="/styleguide/section-frameworkscreen.html">Framework Screen</a>
* <a href="/styleguide/section-input.html">Input</a>
* <a href="/styleguide/section-previewphone.html">Preview Phone</a>
* <a href="/styleguide/section-screen.html">App Screen</a>

</section>
<section>
<p id="mvvm"></p>

## Model-View-ViewModel

Like other MV*-approaches the core idea of 'separation of concerns' is conveyed by the Model-View-ViewModel pattern.
That general concept allows to eliminate dependencies between the development of graphical user interfaces and back-end logic.
The main benefit of  MVVM is the loose coupling between the View and the ViewModel that allows for quick exchange of those components as well as easy testing an extensibility.

The three components of that pattern are briefly explained below and their relationship is shown in Figure 1.

###### Model
The Model represents the domain model independent of the data source.
It contains the business logic to retrieve data and may contain validation mechanisms.

###### View
The View represents the layout of the user interface and defines the appearance and structure of screen elements.
It may contain UI logic responsible for visual behavior, however does not interact with the data.
That is achieved through data binding which invokes the ViewModel to provide the necessary information.

###### ViewModel
The ViewModel is responsible to maintain the operational state of the application and contains navigation services to process user input.
It manages the data access and converts the response to provide the view with the necessary information.


![alt text](../manual/assets/kss/mvvm_overview.png)

Sources:
* [Martin Fowler](https://www.martinfowler.com/eaaDev/uiArchs.html)
* [Microsoft Docs](https://docs.microsoft.com/en-us/xamarin/xamarin-forms/enterprise-application-patterns/mvvm)
</section>
<section>
<p id="interface"></p>

## Interface Elements
The three elements described below appear throughut the entire framework implementation.
<br>
<br>
![alt text](../manual/assets/kss/elements_schematics.png)

Those elements each have a dedicated chapter presenting and explaining their Layout and Template as well as the necessary Data Document. <br>
The Layout needs to be interacted with. To use the keyboard to interact with the viewed Layout throughout the styleguide,
it needs to receive focus first. <br>
That can be achieved by clicking the box surrounding the Layout or the 'Layout' headline.

### Card
Cards are - next to buttons - the central element for enabling the user to navigate between and interact with the screens.
<br>
Buttons, because of their primitive nature, will not be specifically discussed within this document. The key factor to note is to maintain proper contrast between the label and background color and to indicate special actions or triggers with greater impact.
Additionally, interactable card and button elements should also be selectable using the TAB key of a keyboard.

Cards can either be interacted with themselves or may contain additional elements, like buttons. <br>
The user interaction during the creation process is typically performed with a mouse,
while the consumer app is interacted with on a touchscreen. <br>


##### Structure
The element is structured as follows:

* A 'Card' possesses one 'Template' and one 'Data Document'.
* The 'Template' consists of one 'Layout' document, usually HTML markup and one corresponding 'Style' document usually CSS describing rules on how the 'Layout' is to be displayed.
* The 'Layout' contains at least one 'Data Field'.
* The values of a 'Data Field' are stored within the 'Data Document'.
* The values of each 'Data Field' are determined at runtime from a 'Data Document' depending on the chosen system language.

For documentation purposes sample values should be included within the template.

![alt text](../manual/assets/kss/erd_card.png)

##### Logic
After an action is performed the appropriate navigation method to respond to the user input needs to be invoked.

### Input
Input elements enable more complex user interaction than buttons do. <br>
The input of data like numbers and strings during the creation process is usually performed using a keyboard. <br>
The selection of different fields can be done using the mouse or the TAB key of a keyboard. <br>

An input element should try to actively avoid invalid input values or give visual feedback if wrong values are detected.

##### Structure
The element is structured as follows:

* An 'Input' possesses one 'Template' and one 'Data Document'.
* The 'Template' consists of one 'Layout' document, usually HTML markup, and one corresponding 'Style' document, usually CSS, describing rules on how the 'Layout' is to be displayed.

For documentation purposes sample values should be included within the template.

![alt text](../manual/assets/kss/erd_input.png)

##### Logic
Input fields are self observing objects. If the user takes an input action like a keystroke,
that input is processed and sent to a preview screen if available.

![alt text](../manual/assets/kss/sequence_input.png)
</section>
<section>

### Screen

##### Structure
A 'Screen' element is constructed as follows:
- The 'Template' contains the 'Layout' and 'Page Type' of the 'Screen' element.
- Those determine the 'Style's applied to the 'Template'.
- The 'Layout' consists of a subset of the 'Data Field's provided by the Schema.
- The 'Schema' defines all 'Data Field's available to the 'Layout' and is determined by the 'Page Type'.

For demonstration purposes sample data is included within the template.

- A data document is comprised of the same 'Data Field's as included within the layout.

The actual data document is provided in via the ViewModel. <br>
Consult the API documentation for more details <a href="/documentation/">here</a>.

![alt text](../manual/assets/kss/erd_screen.png)

##### Logic
A screen can only display data and not being interactive is usually the case.
If interaction is mandatory for the content to properly work, that logic needs to be included within the corresponding pages ViewModel.

The buttons displayed within the element footer however, are operated by the overall app's navigation service.
</section>
<section>
<p id="datamodel"></p>

## Data Model

The data model, like the overall framework design, revolves around the structure of a single app screen. <br>
Each page type has its own JSON schema file, defining the necessary properties. <br>
Those files can be inspected alongside the available Layouts within the <a href="/styleguide/section-Screen.html">App Screen</a> chapter.

The base structure contains the following information:
<pre id="formOutput" src="../app-framework/forms/data/basic.schema.json"></pre>
</section>
<section>
That file is built using the following properties:

|  Field  |  Datatype  |  Description  |  Values  |
|---|---|---|---|
|  $schema  |  String  |  The reference to the schema version. |  http://json-schema.org/draft-06/schema#  <br> - V6 is recommended.   |
|  type     |  String  |  The schema type.|  "string", "number", "boolean", null "object", or "array" <br> - __must__ equal "object".  |
|  name     |  String  |  The page type.  |  i.e. "admission", "person", or "event".  |
|  sortBy   |  String  |  The property key different pages should be sorted by.  |  "name", "caption", or "date" <br> - __must__ be contained within the properties object. |
|  properties |  Object |  This object contains the properties, i.e. available data elements, of the page type.  |  This object is described __seperately__ in the main section of each page type in the <a href="/styleguide/section-Screen.html">App Screens</a> chapter.  |
|  additionalProperties  |  boolean |  This marker makes sure, that only defined properties are allowed.  |  true or false  <br> - true is recommended.  |
|  required   |  Array   |  This array may contain property keys which must be included in the object.  |  i.e. ["layout", "name", "text"] <br> - "layout" must be included!  |

The advantage of this structure is the flexibility it offers while maintaining an overarching and orderly setup.
</section>
