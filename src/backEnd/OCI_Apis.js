/*
    Version 1.0.1

    Before running this example, install necessary dependencies by running:
    npm install http-signature jssha
*/

var fs = require('fs');
var https = require('https');
var os = require('os');
var httpSignature = require('http-signature');
var jsSHA = require("jssha");

var tenancyId;
var authUserId;
var keyFingerprint;
var privateKey; //fs.readFileSync(privateKeyPath, 'ascii');*/

var identityDomain = "identity.us-ashburn-1.oraclecloud.com"; //identity.us-phoenix-1.oraclecloud.com
var coreServicesDomain = "iaas.us-ashburn-1.oraclecloud.com"; //iaas.us-phoenix-1.oraclecloud.com
var resourceManagerDomain = "resourcemanager.us-phoenix-1.oraclecloud.com"; //https://resourcemanager.us-phoenix-1.oraclecloud.com
var region = "us-ashburn-1";

// signing function as described at https://docs.cloud.oracle.com/Content/API/Concepts/signingrequests.htm
function sign(request, options) {

    var apiKeyId = options.tenancyId + "/" + options.userId + "/" + options.keyFingerprint;

    var headersToSign = [
        "host",
        "date",
        "(request-target)"
    ];

    var methodsThatRequireExtraHeaders = ["POST", "PUT"];

    if(methodsThatRequireExtraHeaders.indexOf(request.method.toUpperCase()) !== -1) {
        options.body = options.body || "";

        var shaObj = new jsSHA("SHA-256", "TEXT");
        shaObj.update(options.body);

        request.setHeader("Content-Length", options.body.length);
        request.setHeader("x-content-sha256", shaObj.getHash('B64'));

        headersToSign = headersToSign.concat([
            "content-type",
            "content-length",
            "x-content-sha256"
        ]);
    }

    httpSignature.sign(request, {
        key: options.privateKey,
        keyId: apiKeyId,
        headers: headersToSign
    });

    var newAuthHeaderValue = request.getHeader("Authorization").replace("Signature ", "Signature version=\"1\",");
    request.setHeader("Authorization", newAuthHeaderValue);
}

// generates a function to handle the https.request response object
function handleRequest(callback,requestBody) {

    return function(response) {
        var responseBody = "";

        response.on('data', function(chunk) {
            responseBody += chunk;
        });

        response.on('end', function() {
            try{
              callback(JSON.parse(responseBody),requestBody);
            }
            catch{
              callback(responseBody,requestBody);
            }

        });
    }
}

module.exports = {
    init: function(userAuthFilePath,userConfigFilePath){
      if(fs.existsSync(userAuthFilePath)) {
          fs.readFile(userAuthFilePath, "utf8", function(err, data){
              if(err) throw err;
              if(data != null){
                console.log("Done: User Auth File Found - Setting OCI Authentication Variables");
                module.exports.setAuthCredentials(JSON.parse(data));
              }
          });
      }else{
        console.log("Done: user Auth File Not Found");
      }

      if(fs.existsSync(userConfigFilePath)) {
          fs.readFile(userConfigFilePath, "utf8", function(err, data){
              if(err) throw err;
              if(data != null){
                module.exports.setRegion(JSON.parse(data).Authentication.region);
              }
          });
      }else{
        console.log("Done: user Auth File Not Found");
      }

    },
    listTFVer: function(compartmentId,creds,callback){
        var options = {
            host: fetchDomain('resourceManagerDomain'),
            path: "/20180917/terraformVersions/?compartmentId=" + compartmentId
        };

        var request = https.request(options, handleRequest(callback));

        var authObj = {
            privateKey: (creds == null) ? privateKey : creds.privateKey,
            keyFingerprint: (creds == null) ? keyFingerprint : creds.keyFingerprint,
            tenancyId: (creds == null) ? tenancyId : creds.tenancyId,
            userId: (creds == null) ? authUserId : creds.userId
        }

        sign(request, authObj);

        request.end();

    },
    createORMStack: function(compartmentId, stackName, variables, workingDirectory, zipFileBase64Encoded, callback){
          var body = JSON.stringify({
            "compartmentId": compartmentId,
            "displayName": stackName, //"ORM_EBS_TF",
            "description": "This stack is created using the automation UI.",
            "variables": variables,
            "configSource": {
              "configSourceType": "ZIP_UPLOAD",
              "workingDirectory": workingDirectory,
              "zipFileBase64Encoded": zipFileBase64Encoded
            }
          });

          var options = {
              host: fetchDomain('resourceManagerDomain'),
              path: '/20180917/stacks',
              method: 'POST',
              headers: {
                  "Content-Type": "application/json",
              }
          };

          var request = https.request(options, handleRequest(callback));

          sign(request, {
              body: body,
              privateKey: privateKey,
              keyFingerprint: keyFingerprint,
              tenancyId: tenancyId,
              userId: authUserId
          });

          request.end(body);
    },
    createORMJob: function(stackId,planId,freeFormTag,callback){
          var body;

          if(planId == null){
            body = JSON.stringify({
              "stackId": stackId,//"ocid1.ormstack.oc1.phx.aaaaaaaar3pfiavhhufjhu5ettnff7qc5buqkzfc2snvl4taa546b7xwrema",
              "jobOperationDetails": {
                  "operation": "PLAN"
              },
              freeformTags: freeFormTag
            });
          }
          else{
            body = JSON.stringify({
              "stackId": stackId,//"ocid1.ormstack.oc1.phx.aaaaaaaar3pfiavhhufjhu5ettnff7qc5buqkzfc2snvl4taa546b7xwrema",
              "jobOperationDetails": {
                  "operation": "APPLY",
                  "executionPlanStrategy": "FROM_PLAN_JOB_ID",
                  "executionPlanJobId": planId
              },
              freeformTags: freeFormTag
            });
          }

          var options = {
              host: fetchDomain('resourceManagerDomain'),
              path: '/20180917/jobs',
              method: 'POST',
              headers: {
                  "Content-Type": "application/json",
              }
          };

          var request = https.request(options, handleRequest(callback));

          sign(request, {
              body: body,
              privateKey: privateKey,
              keyFingerprint: keyFingerprint,
              tenancyId: tenancyId,
              userId: authUserId
          });

          request.end(body);
    },
    getJob: function(jobId,callback){
      var options = {
          host: fetchDomain('resourceManagerDomain'),
          path: "/20180917/jobs/" + encodeURIComponent(jobId)
      };

      var request = https.request(options, handleRequest(callback));

      sign(request, {
          privateKey: privateKey,
          keyFingerprint: keyFingerprint,
          tenancyId: tenancyId,
          userId: authUserId
      });

      request.end();
    },
    getJobsList: function(stackId,callback){
        var options = {
            host: fetchDomain('resourceManagerDomain'),
            path: "/20180917/jobs/?stackId=" + stackId
        };

        var request = https.request(options, handleRequest(callback));

        sign(request, {
            privateKey: privateKey,
            keyFingerprint: keyFingerprint,
            tenancyId: tenancyId,
            userId: authUserId
        });

        request.end();
    },
    getJobLogs: function(jobId,callback){
          var options = {
              host: fetchDomain('resourceManagerDomain'),
              path: `/20180917/jobs/${encodeURIComponent(jobId)}/logs/content`
          };

          var request = https.request(options, handleRequest(callback));

          sign(request, {
              privateKey: privateKey,
              keyFingerprint: keyFingerprint,
              tenancyId: tenancyId,
              userId: authUserId
          });

          request.end();
    },
    updateORMStack: function(compartmentId, stackId, variables, workingDirectory, zipFileBase64Encoded, callback){

          var body = JSON.stringify({
            "description": "This stack is created using the automation UI. Last Update: " + new Date().toUTCString(),
            "variables": variables,
            "configSource": {
              "configSourceType": "ZIP_UPLOAD",
              "workingDirectory": workingDirectory,
              "zipFileBase64Encoded": zipFileBase64Encoded
            }
          });

          var options = {
              host: fetchDomain('resourceManagerDomain'),
              path: '/20180917/stacks/' + encodeURIComponent(stackId),
              method: 'PUT',
              headers: {
                  "Content-Type": "application/json",
              }
          };

          var request = https.request(options, handleRequest(callback,{compartmentId: compartmentId}));

          sign(request, {
              body: body,
              privateKey: privateKey,
              keyFingerprint: keyFingerprint,
              tenancyId: tenancyId,
              userId: authUserId
          });

          request.end(body);
    },
    listCompartments: function(callback){
        var options = {
            host: fetchDomain('identityDomain'),
            path: "/20160918/compartments/?compartmentId=" + tenancyId + "&accessLevel=ANY&compartmentIdInSubtree=true"
        };

        var request = https.request(options, handleRequest(callback));

        sign(request, {
            privateKey: privateKey,
            keyFingerprint: keyFingerprint,
            tenancyId: tenancyId,
            userId: authUserId
        });

        request.end();

    },
    listStacks: function(compartmentId,callback){
        var options = {
            host: fetchDomain('resourceManagerDomain'),
            path: "/20180917/stacks/?compartmentId=" + compartmentId
        };

        var request = https.request(options, handleRequest(callback));

        sign(request, {
            privateKey: privateKey,
            keyFingerprint: keyFingerprint,
            tenancyId: tenancyId,
            userId: authUserId
        });

        request.end();
    },
    setAuthCredentials: function(creds){

        tenancyId = creds.tenancyId;
        authUserId = creds.userId;
        keyFingerprint = creds.keyFingerprint;
        privateKey = creds.privateKey;

        console.log("Updated OCI Credentials!");
    },
    setRegion: function(regionName){
      region = regionName;
    }
}

function fetchDomain(type){
    switch(type){
      case 'identityDomain':
        return `identity.${region}.oraclecloud.com`;
      case 'coreServicesDomain':
        return `iaas.${region}.oraclecloud.com`;
      case 'resourceManagerDomain':
        return `resourcemanager.${region}.oraclecloud.com`;
      default:
        return "identity.us-ashburn-1.oraclecloud.com";
    }
}

/*------------------------------------------------------------------------------
                                Sample Runs
------------------------------------------------------------------------------*/

/*module.exports.listTFVer(tenancyId,function(data){
  console.log("List TF:");
  console.log(data);
})

module.exports.listStacks(tenancyId,function(data){
    console.log("list stacks:");
    console.log(data);
})*/
