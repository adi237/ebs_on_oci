
window.addEventListener('load',function(){
  console.log("onload called");

  //Initalize all Modals and open the loading modal.
  var modalElems = document.querySelectorAll('.modal');
  var modalInstances = M.Modal.init(modalElems, {"dismissible":false});
  modalInstances[0].open();

  //InitGithub FAB & Helper
  var FABElems = document.querySelectorAll('.fixed-action-btn');
  M.FloatingActionButton.init(FABElems, {direction: 'right',hoverEnabled: true});
  /*var tapTargetElems = document.querySelectorAll('.tap-target');
  var tapTargetInstances = M.TapTarget.init(tapTargetElems);
  tapTargetInstances[0].open();*/

  var ttElems = document.querySelectorAll('.tooltipped');
  M.Tooltip.init(ttElems, {outDuration: 100});

  //Initialize Global Variables
  window.initConfigObj = {};
  window.configObj = {};
  window.userCredentials = {};
  window.editableFields = [];
  window.userGithubConfig = {};
  window.fileInstances = {};
  window.runNames = [];

  //Initialize stepper
  initStepper();

  //Initial fetch of config.
  fetchInitialStructure();

  //checking if user github config already exists on serverside.
  //checkIfUserGithubInfoExists();

  //Hide loader after 3 seconds.
  //setTimeout(function(){ showHideLoader(false) }, 2000);

});

function getStarted(){
  //check if user auth information already exists on serverside.
  setTimeout(function(){ checkIfUserAuthInfoExists() }, 2000);
  
  document.getElementById('landingPage').M_Modal.close();
  showHideLoader(true);
  setTimeout(function(){ showHideLoader(false) }, 2000);
}

//initializing the stepper
function initStepper(){
  var stepper = document.querySelector('.stepper');
  var stepperInstace = new MStepper(stepper, {
     firstActive: 0, // this is the default
     stepTitleNavigation: true,
     linearStepsNavigation: true,
     // Auto generation of a form around the stepper.
     autoFormCreation: true,
     // Auto focus on first input of each step.
     autoFocusInput: true,
     // Set if a loading screen will appear while feedbacks functions are running.
     showFeedbackPreloader: true
  });

  //register for events()
  stepperInstace.stepper.addEventListener("stepchange", loadStepUIComponents);
  window.stepperInstance = stepperInstace;
}

function loadStepUIComponents(event){
  var stepper = event.currentTarget;
  var activeStep = stepper.querySelector("li.active");
  var prevStep = activeStep.previousElementSibling;
  var nextStep = activeStep.nextElementSibling;
  var activeStepContentDiv = activeStep.querySelector(".step-inputForm");


  if(prevStep != null){
    prevStep.classList.remove("wrong");
    prevStep.querySelector(".step-actions").style.position = "absolute";
  }


  if(nextStep != null)
      nextStep.querySelector(".step-actions").style.position = "absolute";

  activeStep.querySelector(".step-actions").style.position = "fixed";

  if(activeStep != null && activeStep.id != "Review"){
    var content = generateHTMLInputElementsForObject(window.configObj[activeStep.id],activeStep.id);
    activeStepContentDiv.innerHTML = content;
    initPagePluginOnInputs(activeStepContentDiv);
  }

  if(activeStep.id == "Review"){
    var content = buildReviewPage(window.configObj);
    activeStep.querySelector(".heading").innerHTML = "Review - " + window.runName;

    activeStepContentDiv.innerHTML = content;
  }


}

function updateConfigObject(obj,inputObj,fileData){

    var parents = inputObj.id.split("|");

    for (var i = 0; i < parents.length - 1; i++)
        if(obj.hasOwnProperty(parents[i]))
            obj = obj[parents[i]];

    obj[parents[i]] = (fileData != null) ? fileData : inputObj.value;

    //Extra logic for CIDR Check
    if(parents[i] == "vcn_cidr")
      onChangeVCNCIDR(inputObj,parents[0]);

    if(parents[i] == "subnet_cidr_block")
      onChangeSubnetCIDR(inputObj,parents[0],parents[1]);
}

//fetching initial config object.
function fetchInitialStructure(){
  axios.get('/getInitialJsonConfig')
        .then(response => {
            console.log("SET window.initConfigObj to initial config fetched from the server");
            window.initConfigObj = response.data.initConfig;
            window.configObj = response.data.initConfig;
            window.editableFields = response.data.editableFields;
            window.runNames = response.data.runNames;
            loadFirstStep();
        })
        .catch(error => console.error(error));
}

function onSubmit(){
  console.log("Submit");

  showHideLoader(true);

  axios.post('/userSelectionConfig', {config: window.configObj, runName: window.runName})
      .then(response => {
        showHideLoader(false);
        showConfirmationModal('review',function(){
            location.reload();
        },response.data);
      })
       .catch(error => {
         console.error(error);
         showHideLoader(false);
       });
}

function loadFirstStep(){
  var stepper = document.getElementsByClassName("stepper")[0];
  //manually call for 1st step.
  if ("createEvent" in document) {
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("stepchange", false, true);
    stepper.dispatchEvent(evt);
  }
}

function nextStepFeedback(destroyFeedback, form, activeStepContent){

  switch(activeStepContent.parentElement.id){
    case "Compute":
      showConfirmationModal("compute",destroyFeedback);
      break;
    case "Authentication":
      showConfirmationModal("runName",destroyFeedback);
      break;
    default:
      destroyFeedback(true);
  }

  // Call destroyFeedback() function when you're done
  // The true parameter will proceed to the next step besides destroying the preloader
  //destroyFeedback(true);
}
