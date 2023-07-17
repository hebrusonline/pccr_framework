//==============================================================================
/**
 * Class representing a DateInput element. <br>
 * The visual representation can be found here:
 * [DateInput]{@link http://localhost:8887/styleguide/section-input.html#input.DateInput}
 * @extends BasicFormElement
 * @memberof Inputs
 */
class DateInput extends BasicFormElement {
  /**
   *Empty constructor.
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   * This method initializes the specific input attributes.
   * @property {string}  name - The name of the element.
   */
  initAttributes() {
    //==Handle date tabs
    let tabRadios = this.firstElementChild.querySelectorAll('.tab_radio');
    let tabLabels = this.firstElementChild.querySelectorAll('.tab_label');
    for (let i = 0; i < tabLabels.length; i++) {

      tabRadios[i].id = this.attributes.name + tabRadios[i].id;
      tabRadios[i].setAttribute('name', 'tab-group-'+this.attributes.name);
      tabLabels[i].setAttribute('for', tabRadios[i].id);
      tabLabels[i].innerHTML = Lang.getString('date_tab_label_'+ i);
    }


    //==Loop through attributes and handle all expected DATE attributes.
    for (let key in this.attributes) {
      if (key === 'name') {
        //==Get input field from template.
        let dateInputs = this.firstElementChild.querySelectorAll('.date_content');
        for(let i = 0; i < dateInputs.length; i++){
          //==Set name attribute.
          let dateInput = dateInputs[i].querySelector('input');

          //==Set initial data.
          if(this.data){
            console.log(this.data);
            if(!this.data['mod'] && i === 0){
              dateInput.value = this.data['date'];
            }else if((this.data['mod'] === 'none' || this.data['mod'] === 'date_century' || this.data['mod'] === 'date_year_only') && i === 1){
              this.firstElementChild.querySelector('._tab2').checked = true;
              if (this.data['mod'] != 'none') {
                this.firstElementChild.querySelector('#'+this.data['mod']).checked = true;
              }
              if(this.data['range']){
                this.firstElementChild.querySelector('#'+this.data['range']).checked = true;
              }
              dateInput.value = this.data['date'];

            }else if(this.data['mod'] === 'free' && i === 2){
              this.firstElementChild.querySelector('._tab3').checked = true;
              dateInput.value = this.data['date'];
            }

          }else{
            console.log('NO DATA');
          }

          dateInput.setAttribute(key, this.attributes[key]);
          //==Set the listener for the in phone preview.
          dateInput.onchange = dateInput.onkeyup = function(event){

            console.log(event.target.max);
            console.log(event.target.value);
            console.log(parseInt(event.target.max) < parseInt(event.target.value));
            if(parseInt(event.target.max) < parseInt(event.target.value)){
              event.target.value = event.target.max;
            } else if(parseInt(event.target.min) > parseInt(event.target.value)){
              event.target.value = event.target.min;
            }

            //==Put entered data into the previw phone.
            try {
              //==Get the phone preview container.
              let phone =  document.querySelector('#phone-container')
                .querySelector('#'+dateInput.name);

              phone.innerHTML = dateInput.value;

              //== uncheck if selected
              let selected = this.firstElementChild.querySelector('#date_ranges').querySelector('input:checked');
              if(selected){
                selected.checked = false;
              }
              selected = this.firstElementChild.querySelector('#date_ranges').querySelector('date_year_only');
              if(selected){
                selected.checked = false;
              }
              selected = this.firstElementChild.querySelector('#date_ranges').querySelector('date_century');
              if(selected){
                selected.checked = false;
              }
              //==Error case.
            } catch (e) {
              console.log('No preview possible!');
              console.log(e);
            }
          }.bind(this);
        }

        let modHeader = this.firstElementChild.querySelectorAll('.date_mod_header');
        modHeader[0].innerHTML = Lang.getString('quarter');
        modHeader[1].innerHTML = Lang.getString('third');
        modHeader[2].innerHTML = Lang.getString('half');
        modHeader[3].innerHTML = Lang.getString('modifier');


        let dateContents = this.firstElementChild.querySelector('#date_ranges');
        let dateRangesInputs = dateContents.querySelectorAll('input');
        console.log(dateRangesInputs);
        for(let i = 0; i < dateRangesInputs.length; i++){

          //==Create unique name.
          dateRangesInputs[i].name = dateRangesInputs[i].name + '_' + this.attributes.name;

          //==Set initial data.
          if(this.data){
            dateRangesInputs[i].cheched = this.data[dateRangesInputs[i].id];
          }else{
            console.log('NO DATA');
          }

          dateRangesInputs[i].nextElementSibling.innerHTML = Lang.getString(dateRangesInputs[i].id);
          //==Get the phone preview container.
          let phone =  document.querySelector('#phone-container')
            .querySelector('#'+this.attributes.name);
          if (dateRangesInputs[i].type === 'radio') {
            dateRangesInputs[i].onchange = dateRangesInputs[i].onkeyup = function(event){
              //==Put entered data into the previw phone.
              try {
                let mod = '';
                console.log(event.target.id);
                switch (event.target.id) {
                  case 'first_quarter':
                    mod = ' 1/4';
                    break;
                  case 'second_quarter':
                    mod = ' 2/4';
                    break;
                  case 'third_quarter':
                    mod = ' 3/4';
                    break;
                  case 'fourth_quarter':
                    mod = ' 4/4';
                    break;
                  case 'first_third':
                    mod = ' 1/3';
                    break;
                  case 'second_third':
                    mod = ' 2/3';
                    break;
                  case 'third_third':
                    mod = ' 3/3';
                    break;
                  case 'first_half':
                    mod = ' 1/2';
                    break;
                  case 'second_half':
                    mod = ' 2/2';
                    break;

                  default:
                    mod = ' MOD';
                }
                this.firstElementChild.querySelector('#date_ranges').querySelector('#date_year_only').checked = false;

                let century = '';
                let split = ' ';
                if(this.firstElementChild.querySelector('#date_ranges').querySelector('#date_century').checked){
                  century = Lang.getString('century');
                  split = '.';
                }

                phone.innerHTML = phone.innerHTML.split(split)[0] + century + mod;
                //==Error case.
              } catch (e) {
                console.log('No preview possible!');
                console.log(e);
              }
            }.bind(this);
          }else if(dateRangesInputs[i].type === 'checkbox'){
            if (dateRangesInputs[i].id === 'date_year_only') {
              dateRangesInputs[i].onchange = dateRangesInputs[i].onkeyup = function(event){
                //==Put entered data into the previw phone.
                if(event.target.checked === true){
                  try {
                    phone.innerHTML = phone.innerHTML.split(' ')[0];
                    //==reset mod
                    let selected = this.firstElementChild.querySelector('#date_ranges').querySelector('input:checked');
                    if (selected) {
                      if(selected.id != 'date_year_only'){
                        selected.checked = false;
                      }
                    }
                    //==reset century selection
                    selected = this.firstElementChild.querySelector('#date_century');
                    if(selected.id != 'date_year_only'){
                      selected.checked = false;
                    }

                  } catch (e) {
                    console.log('No preview possible!');
                    console.log(e);
                  }
                }
              }.bind(this);
            }else if(dateRangesInputs[i].id === 'date_century'){
              dateRangesInputs[i].onchange = dateRangesInputs[i].onkeyup = function(event){
                if(event.target.checked === true){
                  //==Put entered data into the previw phone.
                  try {
                    this.firstElementChild.querySelector('#date_ranges').querySelector('#date_year_only').checked = false;
                    let century = '1';
                    if(phone.innerHTML.split(' ')[0] > 100){
                      century = parseInt(phone.innerHTML.split(' ')[0].substring(0, 1)) + 1;
                    }
                    if(phone.innerHTML.split(' ')[0] > 1000){
                      century = parseInt(phone.innerHTML.split(' ')[0].substring(0, 2)) + 1;
                    }

                    let mod = '';
                    if(phone.innerHTML.split(' ')[1]){
                      mod = phone.innerHTML.split(' ')[1];
                    }
                    if(!phone.innerHTML.includes(Lang.getString('century'))){
                      phone.innerHTML = century + Lang.getString('century') + mod;
                    }


                  } catch (e) {
                    console.log('No preview possible!');
                    console.log(e);
                  }
                }else{
                  let selected = this.firstElementChild.querySelector('#date_ranges').querySelector('input:checked');
                  if (selected) {
                    if(selected.id != 'date_year_only' && selected.id != 'date_century'){
                      selected.checked = false;
                    }
                  }
                  let dateInputs = this.firstElementChild.querySelectorAll('.date_content');
                  phone.innerHTML = dateInputs[1].querySelector('input').value;


                }
              }.bind(this);
            }
          }
        }

        let constraints =
          this.firstElementChild.querySelectorAll('.form-constraints');
        let placeholders =
            this.firstElementChild.querySelectorAll('.form-placeholder');
        let descriptions =
          this.firstElementChild.querySelectorAll('.form-description');

        for (let i = 0; i < constraints.length; i++) {
          //==Set constraints string for the DATE element.
          constraints[i].innerHTML =
            Lang.getString('date_constraints_'+ i);
          //==Set the placeholder text.
          placeholders[i].innerHTML =
            Lang.getString(this.attributes[key]);
          descriptions[i].innerHTML =
              Lang.getString(this.attributes.description + '_' + i);
        }
      }
    }
  }

  /**
   * This method resolves the internal data fields and returns an object.
   * @return {object}
   * The data entered.
   *
   * @example
   * Structure  - {fieldName : inputDATEvalue} <br>
   * Values     - {"fieldName": "YYYY-MM-DD"}
   *
   * @see
   * Value structure: [RFC3339 - 5.6 Date/Time Format]{@link https://tools.ietf.org/html/rfc3339}
   */
  getData() {
    console.log('DATA D');
    //==Create the return object.
    let data = {};
    //==Get the input field.

    let dateTabs = this.firstElementChild.querySelectorAll('.tab_radio');

    let active = -1;
    for(let i = 0; i < dateTabs.length; i++){
      console.log(dateTabs[i].checked);
      if(dateTabs[i].checked){
        active = i;
      }
    }

    let dateInputs = this.firstElementChild.querySelectorAll('.date_content');
    let dateInput = dateInputs[active];
    console.log(dateInput);

    if(active === 0){
      //==Add inputValue to return object comply to rfc3339 date.
      data[dateInput.querySelector('input').type] = dateInput.querySelector('input').value.split('.').reverse().join('-');
    }else if(active === 1){
      data['date'] = dateInput.querySelector('input').value;

      let range = dateInput.querySelector('.date_range').querySelectorAll('input');
      data['range'] = 'none';
      for(let i = 0; i < range.length; i++){
        if(range[i].checked){
          data['range'] = range[i].id;
        }
      }

      let mod = dateInput.querySelector('.date_open').querySelectorAll('input');
      data['mod'] = 'none';
      for(let i = 0; i < mod.length; i++){
        if(mod[i].checked){
          data['mod'] = mod[i].id;
        }
      }
    }
    else if(active === 2){
      data['date'] = dateInput.querySelector('input').value;
      data['mod'] = 'free';
    }else{
      console.log('Something went wrong!');
    }
    return data;
  }
}
//==============================================================================
//==EOF=========================================================================
