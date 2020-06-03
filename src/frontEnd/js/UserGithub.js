
function checkIfUserGithubInfoExists(){
  var GH_repoUrlInput = document.getElementById("GH_repoUrl");
  var GH_userIdInput = document.getElementById("GH_userId");
  var GH_passwordInput = document.getElementById("GH_password");
  var GH_EditButton = document.getElementById("GH_editButton");

  axios.get('/getUserGithubInfo')
    .then(response => {
        var res = JSON.parse(response.data.githubConfig);

        if(res != null){
          window.userGithubConfig = res;
          console.log("loaded Github Credentials");
          GH_repoUrlInput.value = window.userGithubConfig.GH_repoUrl;
          GH_userIdInput.value = window.userGithubConfig.GH_userId;
          GH_passwordInput.value = window.userGithubConfig.GH_pass;

          disableGHModalButtons(true);

        }
        else{
          var modal = document.getElementById("githubModel").M_Modal;
          modal.open();
        }

        showHideLoader(false);
    })
    .catch(error => console.error(error));
}

function disableGHModalButtons(disable){

  var GH_repoUrlInput = document.getElementById("GH_repoUrl");
  var GH_userIdInput = document.getElementById("GH_userId");
  var GH_passwordInput = document.getElementById("GH_password");
  var GH_EditButton = document.getElementById("GH_editButton");

  GH_repoUrlInput.disabled = disable;
  GH_userIdInput.disabled = disable;
  GH_passwordInput.disabled = disable;
  GH_EditButton.style.display = disable ? "" : "none";

}

function initGithub(){
  console.log("Initializing Github Repo!");
  var progressElement = document.getElementById("GH_progress");
  var repoUrl = document.getElementById("GH_repoUrl").value;
  var userId = document.getElementById("GH_userId").value;
  var pass = document.getElementById("GH_password").value;
  var errorLabelDiv = document.getElementById("GH_errorLabel");
  var modal = document.getElementById("githubModel").M_Modal;
  var errorLabel = document.getElementById("GH_errorLabel").querySelector("label");

  errorLabelDiv.style.display="none";

  if(repoUrl == "" || userId == "" || pass== ""){
      errorLabelDiv.style.display="";
      return;
  }

  //show progressElement
  progressElement.style.display = "";

  //make backend call to update GitHub information
  axios.post('/initGithub', {GH_repoUrl:repoUrl.replace("https://","").replace("http://",""),GH_userId:userId,GH_pass:pass})
       .then(response => {
          if(response.data.gitInitialized == true)
          {
            progressElement.style.display = "none";
            modal.close();
            M.toast({
                  html: 'Success! Connection established to provided Github Repository.',
                  classes: 'rounded'
              });
          }else{
            progressElement.style.display = "none";
            errorLabel.innerText = "Github Initialization failed. You might have entered the wrong information. Please try again.";
            errorLabelDiv.style.display="";
          }
       })
       .catch(error => {
         console.error(error);
         alert("Network Error: " + error);
         progressElement.style.display = "none";
       });
}
