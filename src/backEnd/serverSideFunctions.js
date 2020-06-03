'use strict';

const fs = require('fs');
const shell = require('shelljs');
var path = require('path');
const OCI = require('./OCI_Apis.js');

const workingDirectory = "Multi-AD-Architecture";
const stackName = "ORM_EBS_TF";
var stackId = "";
const userFilesFolderName = "userFiles";
var resubmitCounter=0;
var intervalId;
var runNameArr = [];

const repoDirectory = path.join(__dirname + '/repo');
const multiADDirectory = path.join(repoDirectory + '/Multi-AD-Architecture');
const singleADDirectory = path.join(repoDirectory + '/Single-AD-Architecture');
const keyDirectory = path.join(multiADDirectory +'/keys');

const jobHistoryFilePath = path.join(__dirname + '/' +userFilesFolderName +'/userJobHistory.json');
const userConfigFilePath = path.join(__dirname + '/' +userFilesFolderName +'/userJSONConfig.json');
const stackDetailsFilePath = path.join(__dirname +'/' +userFilesFolderName + '/userStackConfig.json');
const userAuthFilePath = path.join(__dirname + '/' +userFilesFolderName +'/userAuth.json');



module.exports = {
  getUserConfigFilePath: function (){
    return userConfigFilePath;
  },
  getUserAuthFilePath: function (){
    return userAuthFilePath;
  },
  getJobList: function(callback){
      OCI.getJobsList(stackId, callback);
  },
  getJobLogs: function(jobId, callback){
      OCI.getJobLogs(jobId, callback);
  },
  init: function(){
    console.log("loaded serverSideFunctions");
    OCI.init(module.exports.getUserAuthFilePath(),module.exports.getUserConfigFilePath());
    checkIfStackExists(function(userStackDetailsFile){
      if(userStackDetailsFile.exists)
        stackId = userStackDetailsFile.details.id;
    })
  },
  initUserAuthCredentials: function(creds,callback){

      //test the credentials first.
      console.log("-------------------------------------------------------------");
      console.log("Testing the Credentials Provided by User");

      OCI.listTFVer(creds.compartmentId,creds,function(data){
          console.log(data);

          if(data.code == "NotAuthorizedOrNotFound" || data.code == "NotAuthenticated" || data.code == "InvalidParameter")
          {
              callback({userVerified: false});
          }
          else{
              try {
                OCI.setAuthCredentials(creds);
                console.log("Done: Updated Auth Creds in OCI parameters.");
                fs.writeFileSync(userAuthFilePath, JSON.stringify(creds));
                console.log("Done: Created User Auth File!");
                callback({userVerified: true});
              }
              catch (err) {
                console.error(err);
                callback({userVerified: false,error: err});
              }
          }
      });
  },
  convertJsonToTFVar: function(userConfigObj, userRunName){
    let inputJson = (typeof userConfigObj == "string") ? JSON.parse(userConfigObj) : userConfigObj;

    //runName Add
    runNameArr = [];
    runNameArr.push(userRunName);

    console.log("------------------------------------------------------------");
    console.log("convert JSON to TF File");
    changeToRepoDirectory();

    let tfvars = "";

    for (var p in inputJson) {
      if(p == "Authentication"){
          tfvars += writeAuthVariables(inputJson[p],tfvars);
          continue;
      }

      tfvars += `\n`+ `#${p}`+ `\n`;
      let varObs = inputJson[p];

      for (let v in varObs){

          if(v == "AD"){
            tfvars += `${v} = ${JSON.stringify(varObs[v])} `+ `\n`;
            continue;
          }
          //check if the key is an object. Meaning there are subobjects then we are appending "parent_child=value".
          if (Object.prototype.toString.call(varObs[v]) == Object(varObs[v])){
              let subobjs = varObs[v];

              //only for the subnets jsonobject do we need bastion_subnet_cidr_block i.e. parent_child;
              if(p.toLowerCase() == "subnets")
              {
                for (let s in subobjs){
                    tfvars += `${v.toLowerCase()}_${s} = "${subobjs[s]}" `+ `\n`;
                }
              }
              //for all others like compute, we just need linux_os_version and not Bastion_linux_os_version;
              else
              {
                for (let s in subobjs){
                    tfvars += `${s} = "${subobjs[s]}" `+ `\n`;
                }
              }
          }
          else{
              tfvars += `${v} = "${varObs[v]}" `+ `\n`; //else we will just do "parent=value";
          }
      }
    }

    //add other harcoded Variables
    tfvars += getOtherVariablesNeeded();

    try {
      fs.writeFileSync(multiADDirectory + "/terraform.tfvars", tfvars);
      console.log("Done: Created TFVars File!");
    } catch (err) {
      console.error(err);
    }

    //commitAndPushToGit();
    saveUserConfigFile(userConfigObj);
  },
  zipConfigAndUpload: function(authenticationObj,callback){
      changeToRepoDirectory();

      console.log("------------------------------------------------------------");
      console.log("Zipping file");

      var variables = {
        "tenancy_ocid": authenticationObj.tenancy_ocid,
        "user_ocid": "",
        "fingerprint": "",
        "private_key_path": ""
      }

      if(shell.exec('zip -r '+stackName+'.zip ./modules ./Multi-AD-Architecture', {silent: true}).code == 0){

          encodeZipFileToBase64(repoDirectory + "/" + stackName +'.zip', function(zipFileBase64Encoded){

              checkIfStackExists(function(userStackDetailsFile){

                    if(userStackDetailsFile.exists){
                      //update stack.
                      console.log("Stack Exists with id '" + userStackDetailsFile.details.id + "' . Hence updating Stack.");
                      stackId = userStackDetailsFile.details.id;
                      OCI.updateORMStack(authenticationObj.tenancy_ocid, userStackDetailsFile.details.id, variables, workingDirectory, zipFileBase64Encoded, function(data,requestBody){createUpdateStackCallback(data,requestBody,callback);});
                    }
                    else{
                      //call api to create stack.
                      console.log("Stack does not exist. Hence creating Stack.");
                      OCI.createORMStack(authenticationObj.tenancy_ocid, stackName, variables, workingDirectory, zipFileBase64Encoded, function(data,requestBody){createUpdateStackCallback(data,requestBody,callback);});
                    }
              });

          });

      }
      else{
        console.log("Zipping failed!");
      }
  },
  getJobListHistory: function(callback){

      if(fs.existsSync(jobHistoryFilePath)) {
          fs.readFile(jobHistoryFilePath, "utf8", function(err, data){
              if(err) throw err;
              if(data !== null){
                callback(data);
              }
          });
      }
      else {
        callback("[]");
      }
  }
};

function changeToRepoDirectory(){
    shell.cd(repoDirectory);
}

/*------------------------------------------------------------------------------
--------------------------------------------------------------------------------
                    JSON to tfvars & save key files
--------------------------------------------------------------------------------
------------------------------------------------------------------------------*/

function saveKeyFilesAtLocation(key,value,path){
  let file;

  //filter on only elements having the word key.
  /*file = fs.createWriteStream(path);
  file.write(value);
  file.end();
  */

  try {
    fs.writeFileSync(path, value);
  } catch (err) {
    console.error(err);
  }

  //change the permissions on the file.
  shell.exec('chmod 600 "' + path + '"');
}

function writeAuthVariables(authenticationObj,tfVars){

    var globals = `\n#Authentication\n`;
    var keysForDBAndApp = `\n### SSH Keys for apps and db \n`;
    var keysForBastion = `\n### Public/private keys used on the bastion instance \n`;
    var path;
    var relativePath;

    for(var key in authenticationObj){
        relativePath = "./keys/" + key;
        path = keyDirectory + "/" + key;

        if(key == 'region')
          OCI.setRegion(authenticationObj[key]);

        //check if its a file path
        if(key.indexOf("key") > -1){

          if(key.indexOf("bastion") > -1)
            keysForBastion += `${key.toLowerCase()} = "${relativePath}"`+ `\n`;
          else
            keysForDBAndApp += `${key.toLowerCase()} = "${relativePath}"`+ `\n`;

        //put the key files at particular location.
        saveKeyFilesAtLocation(key,authenticationObj[key],path);
        }
        else {
            globals += `${key.toLowerCase()} = "${authenticationObj[key]}"`+ `\n`;
        }
    }

    tfVars += globals + keysForDBAndApp + keysForBastion;
    //tfVars.end();
    return tfVars;
}

function getOtherVariablesNeeded(){
  return `\n##### Other Hardcoded Variables Not Coming From UI #####\n
#customer onpremises DC network
# onpremises_network_cidr_block = "192.168.10.0/24"

#WAF Variables
enable_waas = "false" // This variable enable or disable terraform waas module
waas_policy_display_name = "ebs_waas_policy"
public_allow_url = "/public"
whitelist = ["202.200.140.120", "203.201.140.121"]

#Autoscale Configuration
#enable_autoscaling_pools = "false" // This variable enable or disable terraform autoscaling module
autoscale_displayName = "EBS"
initialCapacity = "1"
maxCapacity = "2"
minCapacity = "1"
scaleUpCPUthreshold = "70"
scaleInCPUthreshold = "40"

### FSS
# Mount path for application filesystem
fss_primary_mount_path = "/u01/install/APPS"
# Set filesystem limit
fss_limit_size_in_gb = "500"\n`;
}

function saveUserConfigFile(userConfigObj){
  try {
    fs.writeFileSync(userConfigFilePath, JSON.stringify(userConfigObj));
  } catch (err) {
    console.error(err);
  }
}

/*------------------------------------------------------------------------------
--------------------------------------------------------------------------------
                ORM Stack And Jobs - Zip and Upload Logic
--------------------------------------------------------------------------------
------------------------------------------------------------------------------*/
function encodeZipFileToBase64(filePath,callback){
    console.log("Encoding Zip File");

    if(fs.existsSync(filePath)) {
        fs.readFile(filePath, "binary", function(err, data){
            if(err) throw err;
            if(data !== null){
              console.log("Done: Encoded Zip File.");
              callback(Buffer.from(data, 'binary').toString('base64'));
            }
        });
    }else{
      console.log("Done: Zip File Does Not Exist!");
    }
}

function checkIfStackExists(callback){
  var returnObj={
    exists: false,
    details: ""
  };

  console.log("------------------------------------------------------------");
  console.log("Check if Stack Exists");

  if(fs.existsSync(stackDetailsFilePath)) {
      fs.readFile(stackDetailsFilePath, "utf8", function(err, data){
          if(err) throw err;
          if(data !== null){
            returnObj.exists = true;
            returnObj.details = JSON.parse(data);
            console.log("Done: Stack Exist.");
            callback(returnObj);
          }
      });
  }
  else{
    console.log("Done: Stack Does Not Exist.");
    callback(returnObj);
  }
}

function createUpdateStackCallback(data,requestBody,callback){

    console.log("------------------------------------------------------------");
    console.log("Callback Received");

    var returnObj={
        status: "failed",
        errMsg: ""
    };

    if(data.code == "NotAuthorizedOrNotFound" && resubmitCounter < 2)
    {
      resubmitCounter++;
      console.log("Some Error Occurred. Hence, error handling and deleting old file and resubmitting new flow.");
      //file exists but stack does not exist on OCI.
      shell.exec('rm "'+stackDetailsFilePath + '"');
      stackId="";

      //manually re-submit
      module.exports.zipConfigAndUpload({tenancy_ocid: requestBody.compartmentId},callback);
      return;
    }
    else if(data.code == "InvalidParameter"){
      console.log(data.code + ": " + data.message);
      returnObj.errMsg = data.code + ": " + data.message;
      callback(returnObj);
      return;
    }
    else if(data.code == "LimitExceeded"){
      console.log(data.code + ": " + data.message);
      returnObj.errMsg = data.code + ": " + data.message;
      callback(returnObj);
      return;
    }

    if(resubmitCounter >= 2){
        resubmitCounter=0;
        return;
    }


    //create or update the stack details file.
    createStackDetailsFile(data);

    //at end delete the zip.
    console.log("Deleting Zip file.");
    shell.exec('rm '+stackName+'.zip', {silent: true});

    //PLAN
    console.log("Calling ORM TF Plan API");
    OCI.createORMJob(stackId, null, {"runName": runNameArr[0]}, function(planData){


        returnObj.status = "success";
        returnObj.stackId = stackId;
        returnObj.planData = planData;

        //runName Add
        runNameArr.push(planData.id);

        callback(returnObj);

        //console.log("------------------------------------------------------------");
        //console.log("Polling ORM TF Plan API");
        //pollPlanJob(planData);

        intervalId = setInterval(function(){
            pollPlanJob(planData);
        }, 3000);

    });
}

function pollPlanJob(planData){

    OCI.getJob(planData.id,function(planJobStatusData){

        if(planJobStatusData.lifecycleState == "SUCCEEDED"){
            console.log("ORM TF Plan API: success.");
            console.log("------------------------------------------------------------");
            console.log("Calling ORM TF Apply API");
            clearInterval(intervalId);

            //APPLY
            OCI.createORMJob(stackId, planData.id, {"runName": runNameArr[0]}, function(applyData){
                  //console.log("------------------------------------------------------------");
                  //console.log("Polling ORM TF Apply API");
                  console.log(applyData);

                  //runName Add
                  runNameArr.push(applyData.id);
                  createUpdateUserJobHistoryFile();
            });
        }
        else if(planJobStatusData.lifecycleState == "FAILED"){
          console.log("ORM TF Plan API: failed. Details: ");
          console.log(planJobStatusData.failureDetails.code);
          console.log(planJobStatusData.failureDetails.message);
          clearInterval(intervalId);
        }
        else{
          console.log("ORM TF Plan API: STATUS - " + planJobStatusData.lifecycleState);
        }

    });
}

function createStackDetailsFile(content){
  console.log("Creating User Stack File.");
  stackId = content.id;
  try {
    fs.writeFileSync(stackDetailsFilePath, JSON.stringify(content));
    console.log("Done: Created User Stack File!");
  } catch (err) {
    console.error(err);
  }
}

function createUpdateUserJobHistoryFile(){
    //runNameArr
    var content = {};
    content[runNameArr[0]] = [runNameArr[1],runNameArr[2]];
    runNameArr = [];

    if(fs.existsSync(jobHistoryFilePath)) {
        fs.readFile(jobHistoryFilePath, "utf8", function(err, data){
            if(err) throw err;
            if(data !== null){
              console.log("Done: Run Name File Exists, Hence Updating.");
              Object.assign(content, JSON.parse(data));
              writeJobHistoryFile(content);
            }
        });
    }
    else {
      console.log("Done: Run Name File Does Not Exist, Hence Creating.");
      writeJobHistoryFile(content);
    }
}

function writeJobHistoryFile(content){
    //writeToFile
    try {
      fs.writeFileSync(jobHistoryFilePath, JSON.stringify(content));
      console.log("Done: Created User Stack File!");
    } catch (err) {
      console.error(err);
    }
}
