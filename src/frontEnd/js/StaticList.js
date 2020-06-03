const optionList = {
  "region":{
    "US East (Ashburn)": "us-ashburn-1",
    "US West (Phoenix)": "us-phoenix-1"
  },
  "linux_os_version":{
    "Oracle Linux 7.7": "7.7",
    "Oracle Linux 7.8": "7.8"
  },
  "app_instance_shape":{
    "VM.Standard1.1, 1 core, 7Gb mem, 0.6 N/W, 2 VNICs": "VM.Standard1.1",
    "VM.Standard1.2, 2 core, 14Gb mem, 1.2 N/W, 2 VNICs": "VM.Standard1.2",
    "VM.Standard2.1, 1 core, 15Gb mem, 1 N/W, 2 VNICs": "VM.Standard2.1",
    "VM.Standard2.2, 2 core, 30Gb mem, 2 N/W, 2 VNICs": "VM.Standard2.2",
    "VM.Standard2.4, 4 core, 60Gb mem, 4.1 N/W, 4 VNICs": "VM.Standard2.4",
    "VM.Standard2.16, 16 core, 240Gb mem, 16.4 N/W, 16 VNICs": "VM.Standard2.16",
    "VM.Standard.E2.1, 1 core, 8Gb mem, 0.7 N/W, 2 VNICs": "VM.Standard2.24",
    "VM.Standard.E2.2, 2 core, 16Gb mem, 1.4 N/W, 2 VNICs": "	VM.Standard.E2.2",
    "VM.Standard.B1.1, 1 core, 12Gb mem, 0.6 N/W, 2 VNICs": "VM.Standard.B1.1",
    "VM.Standard.B1.2, 2 core, 24Gb mem, 1.2 N/W, 2 VNICs": "VM.Standard.B1.2",
    "VM.DenseIO2.24, 24 core, 320GB mem, 24.6Gbps N/W, 24 VNICs": "VM.DenseIO2.24"
  },
  "db_edition": {
    "Standard Edition": "STANDARD_EDITION",
    "Enterprise Edition": "ENTERPRISE_EDITION",
    "Enterprise Edition High Performance": "ENTERPRISE_EDITION_HIGH_PERFORMANCE",
    "Enterprise Edition Extreme Performance": "ENTERPRISE_EDITION_EXTREME_PERFORMANCE"
  },
  "db_license_model": {
    "LICENSE INCLUDED": "LICENSE_INCLUDED",
    "BYOL": "BYOL"
  },
  "db_version": {
    "18c" : "18.0.0.0",
    "19c" : "19.0.0.0"
  },
  "db_instance_shape": {
    "VM.Standard2.1, 1 core": "VM.Standard2.1",
    "VM.Standard2.2, 2 core": "VM.Standard2.2",
    "VM.Standard2.4, 4 core": "VM.Standard2.4",
    "VM.Standard2.8, 8 core": "VM.Standard2.8",
    "VM.Standard2.16, 16 core": "VM.Standard2.16",
    "VM.Standard2.24, 24 core": "VM.Standard2.24"
  }
};

function checkIfInputIsStaticList(key){
  return optionList.hasOwnProperty(key);
}


function createStaticList(inputElement,displayName,id,value){
  var returnHTMLStr = `<div class="row">
                        <div class="input-field col s6">
                          <select id="`+ id +`" required onchange="updateConfigObject(window.configObj,this);">
                            <option value="" `+ (value != "" ? "" : "selected") +`>Choose your option</option>`;

  for (var key in optionList[inputElement]){
      returnHTMLStr += `<option value="`+ optionList[inputElement][key] +`" `+ (value == optionList[inputElement][key] ? "selected" : "")  +`>`+ key +`</option>`
  }

  returnHTMLStr += `</select>
                    <label>`+ displayName +`</label>
                  </div>
                 </div>`;

  return returnHTMLStr;
}


/*
switch(inputElement){
  case 'region':
    for (var key in optionList[inputElement]){
        returnHTMLStr += `<option value="`+ optionList[inputElement][key] +`" `+ (value == optionList[inputElement][key] ? "selected" : "")  +`>`+ key +`</option>`
    }
    break;
  case 'linux_os_version':
    for (var key in optionList[inputElement]){
        returnHTMLStr += `<option value="`+ optionList[inputElement][key] +`" `+ (value == optionList[inputElement][key] ? "selected" : "")  +`>`+ key +`</option>`
    }
    break;
  case 'app_instance_shape':
    for (var key in optionList[inputElement]){
        returnHTMLStr += `<option value="`+ optionList[inputElement][key] +`" `+ (value == optionList[inputElement][key] ? "selected" : "")  +`>`+ key +`</option>`
    }
    break;
  case 'db_edition':
    for (var key in optionList[inputElement]){
        returnHTMLStr += `<option value="`+ optionList[inputElement][key] +`" `+ (value == optionList[inputElement][key] ? "selected" : "")  +`>`+ key +`</option>`
    }
    break;
  case 'db_license_model':
    for (var key in optionList[inputElement]){
        returnHTMLStr += `<option value="`+ optionList[inputElement][key] +`" `+ (value == optionList[inputElement][key] ? "selected" : "")  +`>`+ key +`</option>`
    }
    break;
  case 'db_version':
    for (var key in optionList[inputElement]){
        returnHTMLStr += `<option value="`+ optionList[inputElement][key] +`" `+ (value == optionList[inputElement][key] ? "selected" : "")  +`>`+ key +`</option>`
    }
    break;
  case 'db_instance_shape':
    for (var key in optionList[inputElement]){
        returnHTMLStr += `<option value="`+ optionList[inputElement][key] +`" `+ (value == optionList[inputElement][key] ? "selected" : "")  +`>`+ key +`</option>`
    }
    break;
}

*/
