//==============================================================================
/**
 * Class representing a LocationInput element. <br>
 * The visual representation can be found here:
 * [LocationInput]{@link http://localhost:8887/styleguide/section-input.html#input.LocationInput}
 * @extends BasicFormElement
 * @memberof Inputs
 */
class LocationInput extends BasicFormElement {
  /**
   *Empty constructor.
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   *This method initializes the specific attributes of a LOCATION input element.
   * @property {string}  name - The name of the element.
   */
  initAttributes() {
    //==Set the constraints string for the LOCATION element.
    this.firstElementChild.querySelector('.form-constraints').innerHTML =
      Lang.getString('location_constraints');

    //==Get input field for Maps API.
    let locationInput = this;

    //==Loop through attributes  and handle all expected LOCATION attributes.
    for (let key in this.attributes) {
      if (key === 'name') {
        //==Set name attribute.
        locationInput.setAttribute(key, this.attributes[key]);
        this.name = this.attributes[key];
        //==Set custom input type according to standarized structure.
        locationInput.setAttribute('type', 'location');

        //==Set the placeholder text.
        this.firstElementChild.querySelector('.form-placeholder').innerHTML =
          Lang.getString(this.attributes[key]);
        //==Set the description text.
        this.firstElementChild.querySelector('.form-description').innerHTML =
          Lang.getString(this.attributes.description);
      }
    }
    //==Initialize the map through the API.
    this.initMap();
  }

  /**
  * Render the map on screen and add listener to put a map on preview phone.<br>
  * API Documentation: <br>
  * The Marker on the map: [Map with Marker]{@link https://developers.google.com/maps/documentation/javascript/adding-a-google-map}
  * <br>
  * Make the Marker draggable: [Draggable Pin]{@link https://stackoverflow.com/questions/38137071/google-map-api-drag-and-drop-pin?rq=1}
  */
  initMap() {
    let mapCenter = {latitude: 48.56, longitude: 13.45};
    if(this.data){
      mapCenter = this.data;
    }
    this.lat = mapCenter.latitude;
    this.lng = mapCenter.longitude;

    let mapArea = document.querySelector('#locationInput');

    //==Create new map.
    let map = new google.maps.Map(mapArea, {
      //==Initialize map Position at Uni Passau.
      center: {lat: this.lat ,lng: this.lng},
      zoom: 12
    });
    //==Put draggable marker onto the map.
    let marker = new google.maps.Marker({
      map: map,
      position: {lat: this.lat, lng: this.lng},
      draggable: true
    });
    //==Set the listener for the in phone preview.
    google.maps.event.addListener(marker, 'dragend', function() {
      this.lat = marker.getPosition().lat();
      this.lng = marker.getPosition().lng();
      //==Get the phone preview container.
      let phone =  document
        .querySelector('#phone-container').querySelector('#'+ this.name);
      //==Create new map.
      let map = new google.maps.Map(phone, {
        center: {lat: this.lat, lng: this.lng},
        zoom: 15
      });
      //==Put marker onto the map.
      let mark = new google.maps.Marker({
        map: map,
        position: {lat: this.lat, lng: this.lng},
        draggable: false
      });
    }.bind(this));
  }

  /**
   * This method resolves the internal data fields and return  an object.
   * @return {object}
   * The entered data.
   * @example
   * Structure  -
   * {
   *  latitude : value,
   *  longitude : value
   * }
   *
   * Values     -
   *  {
   *    "latitude" : number,
   *    "longitude" : number
   *  }
   */
  getData() {
    console.log('DATA L');
    //==Get the location info from the element.
    try {
      return {
        'latitude': this.lat,
        'longitude': this.lng
      };
      //==Error case.
    } catch (e) {
      console.log('An error occured!');
      return {
        'latitude': undefined,
        'longitude': undefined
      };
    }
  }
}
//==============================================================================
//==EOF=========================================================================
