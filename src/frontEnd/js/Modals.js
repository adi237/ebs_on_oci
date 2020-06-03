let privateKeyFileValue = "";

function onSelectAD(single){
  document.getElementById("AD_doneButton").style.display = "";
  var singleADCard = document.getElementById("AD_singleADCard");
  var multiADCard = document.getElementById("AD_multiADCard");

  var radioOptionsDiv = document.getElementById("AD_radioOptions");
  var innerHTML = `<label style="font-size: 15px;"> Please select an option: </label>`;

  radioOptionsDiv.style.display = "";

  if(single) {

    //Show Highlights
    singleADCard.style.border= "2px solid darkorange";
    singleADCard.querySelector(".btn-floating").style.display="";
    multiADCard.style.border= "";
    multiADCard.querySelector(".btn-floating").style.display="none";

    //Build Radio group Div
    window.configObj.Compute.AD = ["1"];
    innerHTML += `<p>
      <label onclick="window.configObj.Compute.AD=['1'];">
        <input name="group1" type="radio" checked />
        <span>AD-1</span>
      </label> &nbsp; &nbsp;
      <label onclick="window.configObj.Compute.AD=['2'];">
        <input name="group1" type="radio" />
        <span>AD-2</span>
      </label> &nbsp; &nbsp;
      <label onclick="window.configObj.Compute.AD=['3'];">
        <input name="group1" type="radio" />
        <span>AD-3</span>
      </label>
    </p>`
  }
  else {

    //show Highlights
    singleADCard.style.border= "";
    singleADCard.querySelector(".btn-floating").style.display="none";
    multiADCard.style.border= "2px solid darkorange";
    multiADCard.querySelector(".btn-floating").style.display="";

    //Build Radio group Div
    window.configObj.Compute.AD = ["1","2"];
    innerHTML += `<p>
      <label onclick="window.configObj.Compute.AD=['1','2'];">
        <input name="group2" type="radio" checked />
        <span>AD-1,2</span>
      </label> &nbsp; &nbsp;
      <label onclick="window.configObj.Compute.AD=['1','3'];">
        <input name="group2" type="radio" />
        <span>AD-1,3</span>
      </label> &nbsp; &nbsp;
      <label onclick="window.configObj.Compute.AD=['2','3'];">
        <input name="group2" type="radio" />
        <span>AD-2,3</span>
      </label>
    </p>`;
  }
  radioOptionsDiv.innerHTML = innerHTML;
}

function showConfirmationModal(type,callback,options){
  var modal = document.getElementById('computeSureModal');
  var contentDiv = modal.querySelector(".modal-content");
  var doneButton = modal.querySelector("a[id=CSM_doneButton]");
  var backButton = modal.querySelector("a[id=CSM_backButton]");
  var divModalFooter =  modal.querySelector(".modal-footer");
  var errLbl = modal.querySelector('.errorLabel');
  errLbl.style.display="none";
  divModalFooter.style.display="";

  modal.style.width="65%";
  contentDiv.style.padding="24px";
  contentDiv.style.paddingBottom="0px";
  doneButton.style.display="";
  backButton.style.display="";
  var innerHTML;

  switch(type){
    case 'compute':
        if(window.configObj.Compute.AD.length == 2){

          doneButton.onclick = function(){
            modal.M_Modal.close();
            callback(true);
          };

          backButton.onclick = function(){
            modal.M_Modal.close();
            callback(false);
          };

          contentDiv.innerHTML = `<h5>Please Note!</h5>
                        <p style="font-size:15px;"> Since you have selected multi AD Architecture, a total of <b style="color:darkorange">`
                        +parseInt(window.configObj.Compute.AppTier.app_instance_count)*2 +
                        ` apptier instances</b> will be created. <br/> That is  <b style="color:darkorange">`
                        + parseInt(window.configObj.Compute.AppTier.app_instance_count) +
                        ` in each AD.</b></p>`;

          modal.M_Modal.open();
          modal.M_Modal.options.dismissible = false;
        }
        else{
          callback(true);
        }
    break;
    case 'runName':
        //build runName Modal

        doneButton.onclick = function(){
          var result = onRunNameModalDone(modal);
          if(result) callback(true);
        };

        backButton.onclick = function(){
          modal.M_Modal.close();
          callback(false);
        };

        modal.style.width="40%";

        contentDiv.innerHTML = `<h5>Name Your Job</h5>
                                <p>What would you like to call this job? Once submitted, you can use this name to refer to the job logs.</p>
                                <div class="row">
                                    <div class="input-field col s12">
                                     <i class="material-icons prefix">assignment</i>
                                     <input id="RN_runName" type="text"> </input>
                                     <label for="RN_runName" class="activeLabel"> Job Name<span style="color:red;">*</span> </label>
                                    </div>
                                 </div>`;

        modal.M_Modal.open();
        modal.M_Modal.options.dismissible = false;
    break;
    case 'review':

          doneButton.onclick = function(){
            modal.M_Modal.close();
            callback(true);
          };

          backButton.style.display="none";

          if(options.status == "failed"){
            contentDiv.innerHTML = `<h5 style="color: orangered;"><i class="large material-icons" style="font-size: 1.3rem;">error_outline</i> &nbsp; ${options.status}</h5>
                          <p style="font-size:15px;"> ${options.errMsg} </p>`;

          }
          else if(options.status == "success"){
            contentDiv.innerHTML = `<h5 style="color: limegreen;"><i class="large material-icons" style="font-size: 1.3rem;">check_circle</i> &nbsp; ${options.status.toUpperCase()}</h5>
                        <div style="font-size:13px;">
                          <p> The Stack was updated with the new configuration and plan,apply job was submitted. <br/> Details: </p>
                          <ul style="padding-left:40px;list-style-type:square !important;">
                            <li> <span style="color:darkorange;"><b>Run Name:</b></span> "${window.runName}"</li>
                            <li> <span style="color:darkorange;"><b>Stack Name:</b> </span> "ORM_EBS_TF" </li>
                            <li> <span style="color:darkorange;"><b>Plan Job Name:</b></span> "${options.planData.displayName}"</li>
                          </ul>
                          <p>The Job might take some time. <br/>
                          To view the logs click the
                          <i><b><u> <i class="material-icons" style="color:white;">insert_chart</i> icon from the menu</u></b></i>
                          on the bottom part of the screen.</p>
                        </div>`;
          }


          modal.M_Modal.open();
          modal.M_Modal.options.dismissible = false;
    break;
    case 'diagram':
      doneButton.style.display="none";
      backButton.style.display="none";

      contentDiv.style.padding="0px";
      contentDiv.innerHTML = `<img src= 'img/EBS_Architecture.jpg' width="950">
                              <div class="fixed-action-btn" style="top: -25px;right: -30px;padding-top: 0px;z-index: 1000000;">
                                <a class="btn-floating white" onclick="document.getElementById('computeSureModal').M_Modal.close();">
                                  <i class="large material-icons" style="color:black">close</i>
                                </a>
                              </div>

                                `;

      divModalFooter.style.display="none";

      modal.style.maxHeight="100%";
      modal.style.overflow="visible";
      modal.M_Modal.open();
      modal.M_Modal.options.dismissible = true;
    break;
  }
}

function onCloseComputeOptionsModal(){
    var computeADCardDiv = document.getElementById("ComputeADCard");
    var titleLabel = computeADCardDiv.querySelector(".card-title");
    var ADLabel = computeADCardDiv.querySelector(".ADNum");

    if(window.configObj.Compute.AD.length > 1){
      titleLabel.innerHTML = "Multi AD"
      ADLabel.innerHTML = window.configObj.Compute.AD;
    }
    else{
      titleLabel.innerHTML = "Single AD"
      ADLabel.innerHTML = window.configObj.Compute.AD;
    }

    document.getElementById('computeOptionsModal').M_Modal.close();
}

function checkIfUserAuthInfoExists(){
  var UC_tenancyOCID = document.getElementById("UC_tenancyOCID");
  var UC_userOCID = document.getElementById("UC_userOCID");
  var UC_fingerprint = document.getElementById("UC_fingerprint");
  var UC_privateKeyFile = document.getElementById("UC_privateKeyFile");
  var UC_compartmentId = document.getElementById("UC_compartmentId");
  initLoginModalFileInput(UC_privateKeyFile);

  axios.get('/getUserAuthInfo')
    .then(response => {
        var res = JSON.parse(response.data.userCredentials);

        if(res != null){
          window.userCredentials = res;
          console.log("loaded User Auth Credentials");
          UC_tenancyOCID.value = window.userCredentials.tenancyId;
          UC_userOCID.value = window.userCredentials.userId;
          UC_fingerprint.value = window.userCredentials.keyFingerprint;
          UC_compartmentId.value = window.userCredentials.compartmentId;

          var blob = new Blob([window.userCredentials.privateKey]);
          blob.name="privateKeyFile";

          window.fileInstances[UC_privateKeyFile.id].addFile(blob);
        }
        else{
          var modal = document.getElementById("loginModel").M_Modal;
          modal.open();
        }

      showHideLoader(false);
    })
    .catch(error => console.error(error));
}

function initLoginModalFileInput(fileInput){
    var fileInstance = FilePond.create( fileInput, {labelIdle: `<span style="color: darkOrange;"> Private Key<span style="color:red;">*</span>: </span> Drag & Drop or <span class="filepond--label-action"> Browse </span>`} );

    fileInstance.onaddfile = function (error,file) {
      if(error) console.log(error);
      var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = function(e) {
          privateKeyFileValue = e.target.result;
        }

        reader.readAsText(file.file);
    };

    fileInstance.onremovefile = function (error, file){
        if(error) console.log(error);
        privateKeyFileValue = "";
    }

    window.fileInstances[fileInput.id] = fileInstance;
}

function initUserAuth(){

      console.log("Initializing userAuth File!");

      var tenancyOCID = document.getElementById("UC_tenancyOCID").value;
      var userOCID = document.getElementById("UC_userOCID").value;
      var fingerprint = document.getElementById("UC_fingerprint").value;
      var compartmentId = document.getElementById("UC_compartmentId").value;
      //var privateKeyFile = document.getElementById("UC_privateKeyFile").value;

      var progressElement = document.getElementById("UC_progress");
      var errorLabelDiv = document.getElementById("UC_errorLabel");
      var modal = document.getElementById("loginModel").M_Modal;
      var errorLabel = document.getElementById("UC_errorLabel").querySelector("label");

      errorLabelDiv.style.display="none";

      if(tenancyOCID == "" || userOCID == "" ||compartmentId == "" || fingerprint == "" || privateKeyFileValue == ""){
          errorLabelDiv.style.display="";
          return;
      }

      //show progressElement
      progressElement.style.display = "";

      window.configObj.Authentication.compartment_ocid = compartmentId;
      document.getElementById("Authentication|compartment_ocid").value = compartmentId;
      document.getElementById("Authentication|compartment_ocid").nextElementSibling.classList.add("active");

      axios.post('/initUserCredentials', {privateKey: privateKeyFileValue,keyFingerprint: fingerprint,tenancyId: tenancyOCID,userId: userOCID,compartmentId: compartmentId})
           .then(response => {
              if(response.data.userVerified == true)
              {
                progressElement.style.display = "none";
                modal.close();
                M.toast({
                      html: 'Success! Connection established to provided Tenancy.',
                      classes: 'rounded'
                  });
              }else{
                progressElement.style.display = "none";
                errorLabel.innerText = "User Verification failed. You might have entered the wrong information. Please try again.";
                errorLabelDiv.style.display="";
              }
           })
           .catch(error => {
             console.error(error);
             alert("Network Error: " + error);
             progressElement.style.display = "none";
           });
}

function initJobListModal(){
  var jobListModal = document.getElementById('jobListModal');
  var tableBody = jobListModal.querySelector('.tableBody');
  var tableHeader = jobListModal.querySelector('.tableHeader');
  var logsDiv = jobListModal.querySelector('#logs');
  var tableDiv = jobListModal.querySelector('#table');
  var progress = jobListModal.querySelector('.progress');

  showHideLoader(true);
  var runNamesJobsObj = {
    "noName": []
  };

  logsDiv.style.marginLeft="2%";
  tableDiv.style.width="50%";
  //tableHeader.style.display="";
  progress.style.display="none";

  //fetch job list data and build table;
  axios.get('/getJobList')
    .then(response => {

        if(response.data.code == "NotAuthorizedOrNotFound" || response.data.code == "InvalidParameter" || response.data.code == "MissingParameter" )
          {
            //tableDiv.innerHTML = "";
          }
        else{

          //foreach job
          response.data.forEach(function(job){
              if(job.freeformTags.hasOwnProperty("runName")){
                  if(runNamesJobsObj.hasOwnProperty(job.freeformTags.runName)){
                    runNamesJobsObj[job.freeformTags.runName].push(job);
                  }else{
                    runNamesJobsObj[job.freeformTags.runName] = [job];
                  }
              }
              else{
                runNamesJobsObj["noName"].push(job);
              }
          });

          //tableBody.innerHTML = addRow(response.data);
          tableDiv.innerHTML = addCollapsibles(runNamesJobsObj);
        }

        jobListModal.M_Modal.open();
        jobListModal.M_Modal.options.dismissible=true;
        showHideLoader(false);
        var collapsibleElems = document.querySelectorAll('.collapsible');
        M.Collapsible.init(collapsibleElems);
    })
    .catch(error => {
      console.error(error);
      alert(error);
      showHideLoader(false);
    });
}

/* noOfFailed codes -

0 - success
1 - inprogress
2 - failure

*/
function addRow(arrJobs){
  var rowHTML= ``;
  var noOfFailed = 0;
  var cssClass = "jobFullSuccess";

  arrJobs.forEach(function(job){

      if(job.lifecycleState == "FAILED") noOfFailed++;
      else if(job.lifecycleState == "IN_PROGRESS") noOfFailed=-100;

      rowHTML += `<tr onclick="getJobLogs('${job.id}','${job.displayName}');">
                      <td>${job.displayName}</td>
                      <td>${job.operation}</td>
                      <td>${new Date(job.timeCreated).toLocaleString()}</td>
                      <td>${job.lifecycleState}</td>
                    </tr>`;
  });

  if(noOfFailed<0)
    cssClass = "jobInProgress";
  else if(noOfFailed==1 && arrJobs.length == 2)
    cssClass = "jobHalfSuccess";
  else if((noOfFailed==1 && arrJobs.length == 1) || noOfFailed==2)
    cssClass = "jobFailure";

  return { rows: rowHTML, cssClass: cssClass};
}

function addCollapsibles(runNamesJobsObj){
  var content=`<h5 style="text-align: center;"> Jobs List </h5><ul class="collapsible jobListCollapsible popout">`;
  var rows=``;
  var collapsibleBodyClass;
  var icon = {
    "jobInProgress" : "settings",
    "jobFailure" : "flash_on",
    "jobHalfSuccess" : "wb_cloudy",
    "jobFullSuccess" : "wb_sunny",
  }

  Object.keys(runNamesJobsObj).forEach(function(runName){

      if(runNamesJobsObj[runName].length > 0){
        var returnObj = addRow(runNamesJobsObj[runName]);
        rows = returnObj.rows;
        content+=`<li>
                    <div class="collapsible-header"><i class="material-icons ${icon[returnObj.cssClass]}-IconColor">${icon[returnObj.cssClass]}</i>${runName}</div>
                    <div class="collapsible-body ${returnObj.cssClass}">
                      <table class="tableHeader highlight centered" style="overflow-y: hidden;display: block;">
                        <thead>
                          <tr>
                              <th>Name</th>
                              <th>Operation</th>
                              <th>Time Created</th>
                              <th>State</th>
                          </tr>
                        </thead>
                        <tbody class="tableBody">
                          ${rows}
                        </tbody>
                      </table>
                    </div>
                  </li>`;
      }
  });

  content+=`</ul>`;
  return content;
}

function getJobLogs(jobId,jobName){
    console.log(jobId);

    var jobListModal = document.getElementById('jobListModal');
    var tableDiv = jobListModal.querySelector('#table');
    var tableHeader = jobListModal.querySelector('.tableHeader');
    var logsDiv = jobListModal.querySelector('#logs');
    var logBody = jobListModal.querySelector('.logBody');
    var fileDownload = jobListModal.querySelector('#fileDownload');
    var progress = jobListModal.querySelector('.progress');
    var jobsListHeading = jobListModal.querySelector('h5');

    logBody.innerHTML = ``;
    progress.style.display="";
    logsDiv.style.marginLeft="0px";
    tableDiv.style.width="0px";
    //tableHeader.style.display="none";
    jobsListHeading.style.display="none";

    var url = '/getJobLogs?jobId='+encodeURIComponent(jobId);
    fileDownload.href=url;
    fileDownload.download=jobName+".txt";

    axios.get(url)
      .then(response => {
          if(response.data.code == "NotAuthorizedOrNotFound" || response.data.code == "InvalidParameter" || response.data.code == "MissingParameter" )
            {
              logBody.innerHTML = JSON.stringify(response.data);
            }
          else{
            logBody.innerHTML = response.data;
          }
          progress.style.display="none";
      })
      .catch(error => {
        console.error(error);
        alert(error);
        progress.style.display="none";
      });
}

function backToJobList(){
  var jobListModal = document.getElementById('jobListModal');
  var tableDiv = jobListModal.querySelector('#table');
  var tableHeader = jobListModal.querySelector('.tableHeader');
  var logsDiv = jobListModal.querySelector('#logs');
  var logBody = jobListModal.querySelector('.logBody');
  var progress = jobListModal.querySelector('.progress');
  var jobsListHeading = jobListModal.querySelector('h5');

  progress.style.display="none";
  tableDiv.style.width="50%";
  //tableHeader.style.display="";
  jobsListHeading.style.display="";
  logsDiv.style.marginLeft="2%";
}

function refreshJobListModal(){

  var jobListModal = document.getElementById('jobListModal');
  var fileDownload = jobListModal.querySelector('#fileDownload');
  var tableDiv = jobListModal.querySelector('#table');
  var jobId = fileDownload.href.split("=")[1];
  var jobName = fileDownload.download;

  if(tableDiv.style.width=="50%")
  {
    initJobListModal();
  }
  else{
    getJobLogs(jobId,jobName);
  }
}

function onRunNameModalDone(modal){
  var runName = modal.querySelector('#RN_runName');
  var errLbl = modal.querySelector('.errorLabel');
  var reg = /^[a-zA-Z0-9]*$/;

  errLbl.style.display="none";

  if(runName.value.indexOf(" ") > -1 || !reg.test(runName.value)){
    errLbl.style.display="";
    errLbl.querySelector("label").innerText = "Only AplhaNumeric string allowed - No Spaces!.";
  }
  else if(runName.value != null && runName.value.trim() != ""){

        //check if name already exists.
        if(!window.runNames.hasOwnProperty(runName.value)){
          window.runName = runName.value;
          modal.M_Modal.close();
          return true;
        }

        errLbl.style.display="";
        errLbl.querySelector("label").innerText = "The name already Exists.";
  }
  else{
    errLbl.style.display="";
    errLbl.querySelector("label").innerText = "Please Enter Some Value.";
  }

  return false;
}

function showHideLoader(show){
  var loader = document.getElementById("loader").M_Modal;

  if(show)
    loader.open();
  else
    loader.close();
}
