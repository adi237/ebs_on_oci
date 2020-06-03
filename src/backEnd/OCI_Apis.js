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

/*var zipFileBase64Encoded = "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";

module.exports.createORMStack(tenancyId, "/test", zipFileBase64Encoded,function(data){
  console.log("create Stack:");
  console.log(data);
});*/
