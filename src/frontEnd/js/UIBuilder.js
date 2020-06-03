function buildReviewPage(userConfig){
    var innerHTML = `<div class="row">`;

    for(var objName in userConfig){
        var Obj = userConfig[objName];
        innerHTML += `<div class="col s12 m4">
          <div class="card reviewCards">
            <div class="card-content white-text">
              <span class="card-title">` + objName +` </span>`;

              if(typeof Obj == "object"){
                  Object.keys(Obj).forEach(function(key){
                    var value = Obj[key];

                    if(key.indexOf("key") > -1){
                        innerHTML += `<label class="reviewKey">`+ capitalizeFirstLetter(key) +`:</label> <label class="reviewValue"> {Key Data} </label><br/>`;
                    }
                    else if(key == "AD"){
                        innerHTML += `<label class="reviewKey"> AD: </label><label class="reviewValue">`+ value +` </label><br/>`;
                    }
                    else
                    {
                        //checking if the value is itself an object. i.e. two levels.
                        if(typeof value == "object"){
                          innerHTML += `<label>`+ capitalizeFirstLetter(key) +`</label><br/>`;
                          Object.keys(value).forEach(function(nestedKey){
                              innerHTML += `&nbsp;<label class="reviewKey">`+ capitalizeFirstLetter(nestedKey) +`:</label> <label class="reviewValue">`+ value[nestedKey] +` </label><br/>`;
                          });
                        }
                        else{
                           innerHTML += `<label class="reviewKey">`+ capitalizeFirstLetter(key) +`:</label> <label class="reviewValue">`+ value +` </label><br/>`;
                        }
                    }
                  });
              }


          innerHTML += `</div>
                      </div>
                    </div>`;
    }


    innerHTML += `</div>`;
    return innerHTML;
}

function generateHTMLInputElementsForObject(Obj,parentId) {
    if(typeof Obj != "object")
      return;

    var innerHTML = ``;
    Object.keys(Obj).forEach(function(key){
      var value = Obj[key];

      //checking if the value is itself an object. i.e. two levels.
      if(typeof value == "object" && !(Array.isArray(value))){
        innerHTML += `<label class="subHeadings">`+ capitalizeFirstLetter(key) +`</label>`
        Object.keys(value).forEach(function(nestedKey){
            innerHTML += generateHTMLInputElement(parentId + "|" + key + "|" + nestedKey,value[nestedKey],nestedKey);
        });
      }
      else{
        innerHTML += generateHTMLInputElement(parentId + "|" + key,value,key);
      }
    });

    return innerHTML;
}

function generateHTMLInputElement(key,value,name){
  name = capitalizeAcronyms(name);
  var displayName = capitalizeFirstLetter(name.replace(/_/g," "));
  var disabled = "";//"disabled";
  var htmlInputElement = "";

  //If name contains the word key and not the word path
  var type = (displayName.indexOf("key") > -1 && displayName.indexOf("path") == -1) ? "file" : "text";
  var activeLabel = (value != "" || type == "file") ? "active" : "";

  if(window.editableFields.indexOf(name) > -1){
      displayName += `<span style='color:red;'>*</span>`
      disabled = "";
  }

  if(type == "file"){
      htmlInputElement += `<label class="fileHeadings" for="`+ key +`">`+ displayName +`</label>`;
                          /*<div class="row">
                            <p>
                              <label onclick="this.parentElement.parentElement.nextElementSibling.querySelector('.fileInput').style.display='';this.parentElement.parentElement.nextElementSibling.querySelector('.textInput').style.display='none';">
                                <input name="group1" type="radio" checked />
                                <span>Upload file</span>
                              </label>
                              <label onclick="this.parentElement.parentElement.nextElementSibling.querySelector('.textInput').style.display='';this.parentElement.parentElement.nextElementSibling.querySelector('.fileInput').style.display='none';">
                                <input name="group1" type="radio" />
                                <span>Type in Path</span>
                              </label>
                            </p>

                          </div>`;*/
      displayName = "";

      /*htmlInputElement += `<div class="row">
                        <div class="input-field col m6">
                         <input class="fileInput"  `+disabled+` value="`+value+`" id="`+ key +`" type="file" onchange="updateConfigObject(window.configObj,this);"> </input>
                        </div>
                        <div class="input-field col m6">
                         <input class="textInput" style="display:none;" `+disabled+` value="`+value+`" id="`+ key +`" type="text" onchange="updateConfigObject(window.configObj,this);"> </input>
                         <label for="`+ key +`" class="`+activeLabel+`">`+ displayName +`</label>
                        </div>
                     </div>`;

    return htmlInputElement;*/
  }

  //create a drop down list for region.
  if(checkIfInputIsStaticList(name.toLowerCase())){
      htmlInputElement += createStaticList(name.toLowerCase(),displayName,key,value);
      return htmlInputElement;
  }

  //create switch for enable_autoscaling_pools
  if(name.toLowerCase() == "enable_autoscaling_pools"){
    htmlInputElement += `<div class="row">
                              <div class="col s3">
                               <label style="color:darkorange;font-size:17px;">`+ displayName +`</label>
                              </div>
                              <div class="col s2">
                                <div class="switch">
                                  <label style="color:darkorange;font-size:17px;">
                                    Off
                                    <input type="checkbox" onchange="document.getElementById('autoScaleHelpLabel').style.display= document.getElementById('autoScaleHelpLabel').style.display == 'none' ? '' : 'none'; window.configObj.Compute.enable_autoscaling_pools= document.getElementById('autoScaleHelpLabel').style.display == 'none' ? 'false' : 'true'; ">
                                    <span class="lever"></span>
                                    On
                                  </label>
                                </div>
                              </div>
                           </div>
                           <div class="row">
                             <div class="col s6">
                              <label id="autoScaleHelpLabel" style="display:none; color:white;">For more information check: <a href='https://github.com/khushboo2243/EBS-on-OCI/blob/master/Instructions.md' target="_blank">configuring autoscaling</a>.</label>
                             </div>
                           </div>
                           `;
    return htmlInputElement;
  }

  if(name.toLowerCase() == "ad"){
    return "";
  }

    htmlInputElement += `<div class="row">
                      <div class="input-field col s6">
                       <input `+disabled+` required value="`+value+`" id="`+ key +`" type="`+ type +`" onchange="updateConfigObject(window.configObj,this);"> </input>
                       <label for="`+ key +`" class="`+activeLabel+`">`+ displayName +`</label>
                       <span class="helper-text" style="letter-spacing:0px;display:none;color:red;">You have entered an incorrect value.</span>
                      </div>
                   </div>`;


  return htmlInputElement;
}

function initPagePluginOnInputs(activeStepContentDiv) {

  // File pond init;
  const inputElements = activeStepContentDiv.querySelectorAll('input[type="file"]');
  inputElements.forEach(
    function(item){

    window.fileInstances[item.id] = FilePond.create( item );

    window.fileInstances[item.id].onaddfile = function (error,file) {

            if(error) console.log(error);

            var reader = new FileReader();

              // Closure to capture the file information.
              reader.onload = function(e) {
                updateConfigObject(window.configObj,item,e.target.result);
              }

              reader.readAsText(file.file);
          };

    window.fileInstances[item.id].onremovefile = function (error, file){
        if(error) console.log(error);
        updateConfigObject(window.configObj,item,"");
    }

    var value = item.getAttribute("value");

    if(value!=null && value!=""){
      var blob = new Blob([value]);
      blob.name = item.id.split("|")[item.id.split("|").length-1];
      window.fileInstances[item.id].addFile(blob);
    }

  });

  //select init;
  var selectElems = document.querySelectorAll('select');
  M.FormSelect.init(selectElems);
}

function capitalizeAcronyms(str){
    return str.replace("cidr","CIDR")
              .replace("vcn","VCN")
              .replace("ssh","SSH")
              .replace("ocid","OCID")
              .replace("dns","DNS")
              .replace("displayname","display name")
              .replace("nat","NAT")
              .replace("drg","DRG")
              .replace("int","INT")
              .replace("fss","FSS")
              .replace("srv","SRV");
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
