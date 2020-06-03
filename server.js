var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');

var serverSideFunctions = require('./src/backEnd/serverSideFunctions.js');

const jsonStructFilePath = path.join(__dirname + "/src/JSON_Struct_v2.json");

var app = express();
const editableFields = [
  "compartment_ocid", "tenancy_ocid", "user_ocid", "fingerprint", "private_key_path",
  "region", "vcn_cidr", "bastion_ssh_public_key", "bastion_ssh_private_key",
  "ssh_public_key", "ssh_private_key", "Region_Name", "vcn_cidr", "vcn_displayname",
  "int_gateway_displayname", "nat_gateway_displayname", "srv_gateway_displayname",
  "bastionseclist_displayname", "dbseclist_displayname", "appseclist_displayname",
  "publbseclist_displayname", "bastion_displayname_rt", "database_displayname_rt",
  "app_displayname_rt", "fss_displayname_rt", "subnet_cidr_block", "subnet_display_name",
  "display_name", "private_load_balancer_display_name", "drg_displayname_rt", "drg_displayname",
  "bastion_compute_display_name", "app_compute_display_name", "database_compute_display_name",
  "public_load_balancer_display_name"
];

//serving static frontEnd Content
app.use(express.static('src/frontEnd'));

//To parse URL encoded data
app.use(bodyParser.urlencoded({ extended: false }));

//To parse json data
app.use(bodyParser.json());

app.get('/', function(req, res){
   res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/getInitialJsonConfig', function(req,res){

    var userConfigFilePath = serverSideFunctions.getUserConfigFilePath();

    //check if user file exists.
    //Meaning that this is not the first time user is loading the app.
    if(fs.existsSync(userConfigFilePath)) {
        //Hence, we have to load and send user config and not the initial config.
        fs.readFile(userConfigFilePath, "utf8", function(err, data){
            if(err) throw err;
            if(data !== null){
              //meaning user config file exists & also meaining
              serverSideFunctions.getJobListHistory(function(runNames){
                  res.send({"initConfig" : JSON.parse(data), "editableFields": editableFields, "runNames": JSON.parse(runNames)});
              });

            }else{
              res.send({"initConfig" : {}, "editableFields": [], "runNames": []});
            }
        });
    }
    else {
      //No user file exists.
        fs.readFile(jsonStructFilePath, "utf8", function(err, data){
            if(err) throw err;
            if(data !== null){
              //console.log(data);
              res.send({"initConfig" : JSON.parse(data), "editableFields": editableFields, "runNames": []});
            }else{
              res.send({"initConfig" : {}, "editableFields": [], "runNames": []});
            }
        });
    }


});

app.post('/userSelectionConfig', function(req,res){
    //This is where you can call a function to convert the JSON object to .tf file.
    console.log(req.body);
    serverSideFunctions.convertJsonToTFVar(req.body.config,req.body.runName);
    serverSideFunctions.zipConfigAndUpload({tenancy_ocid: req.body.config.Authentication.compartment_ocid},
      function(data){
          res.send(data);
      });
});

app.get('/getUserAuthInfo', function(req,res){

    var userAuthFilePath = serverSideFunctions.getUserAuthFilePath();

    if(fs.existsSync(userAuthFilePath)) {
        //Hence, we have to load and send user config and not the initial config.
        fs.readFile(userAuthFilePath, "utf8", function(err, data){
            if(err) throw err;
            if(data !== null && data.trim() !== ""){
              res.send({"userCredentials" : data});
            }else{
              res.send({"userCredentials" : null});
            }
        });
    }
    else{
      res.send({"userCredentials" : null});
    }
});

app.post('/initUserCredentials',function(req,res){
    serverSideFunctions.initUserAuthCredentials(req.body,function(returnObj){
      res.send(returnObj);
    });
});

app.get('/getJobList',function(req,res){
    serverSideFunctions.getJobList(function(data){
      res.send(data);
    });
});

app.get('/getJobLogs',function(req,res){
    serverSideFunctions.getJobLogs(req.query.jobId,function(data){
      res.send(data);
    });
});


//Init serverSideFunctions;
serverSideFunctions.init();

app.listen(3000);

console.log("listening on port 3000........");


/*----------------------------------------------------------------------------
                                  GITHUB CODE
----------------------------------------------------------------------------*/


/*app.get('/getUserGithubInfo',function(req,res){
  var userGithubConfigFilePath = serverSideFunctions.getUserGithubConfigFilePath();
  if(fs.existsSync(userGithubConfigFilePath)) {
      //Hence, we have to load and send user config and not the initial config.
      fs.readFile(userGithubConfigFilePath, "utf8", function(err, data){
          if(err) throw err;
          if(data !== null && data.trim() !== ""){
            res.send({"githubConfig" : data});
          }else{
            res.send({"githubConfig" : null});
          }
      });
  }
  else{
    res.send({"githubConfig" : null});
  }
})

app.post('/initGithub',function(req,res){
    //console.log(new Date() + " - /initGithub - " + JSON.stringify(req.body));
    var initObj = {
      githubInfo: {GH_repoUrl:req.body.GH_repoUrl, GH_userId:req.body.GH_userId, GH_pass:req.body.GH_pass}
    }
    var returnObj = serverSideFunctions.init(initObj);
    res.send({gitInitialized: returnObj.gitInitialized});
});*/

/*serverSideFunctions.convertJsonToTFVar({
  "Authentication": {
    "compartment_ocid" : "" ,
    "tenancy_ocid" : "" ,
    "user_ocid" : "" ,
    "fingerprint" : "" ,
    "private_key_path" : "" ,
    "region" : "ashburn" ,
    "bastion_ssh_public_key" : "" ,
    "bastion_ssh_private_key" : "" ,
    "ssh_public_key" : "" ,
    "ssh_private_key" : ""
  },
  "VCN": {
    "vcn_cidr": "10.0.0.0/16",
    "vcn_displayname": "ebsvcn"
  },
  "Gateways": {
    "int_gateway_displayname" : "igateway",
    "nat_gateway_displayname" : "natgateway",
    "srv_gateway_displayname" : "servicegateway"
  },
  "SecurityList": {
    "bastionseclist_displayname": "bastionseclist",
    "dbseclist_displayname": "dbseclist",
    "appseclist_displayname": "appseclist",
    "publbseclist_displayname": "publbseclist"
  },
  "RouteTable": {
    "bastion_displayname_rt" : "ebsbastionrt",
    "database_displayname_rt" : "ebsdbroute",
    "app_displayname_rt" : "ebsapproute",
    "fss_displayname_rt" : "fssroute"
  },
  "Subnets":{
    "bastion": {
      "subnet_cidr_block" : "10.0.4.0/24",
      "subnet_display_name" : "bastionnet"
    },
    "app": {
      "subnet_cidr_block" : "10.0.3.0/24",
      "subnet_display_name" : "appnet"
    },
    "public_lb": {
      "subnet_cidr_block" : "10.0.5.0/24",
      "subnet_display_name" : "lbsubnetpub"
    },
    "database": {
      "subnet_cidr_block" : "10.0.1.0/24",
      "subnet_display_name" : "dbnet"
    },
    "filestorage": {
      "subnet_cidr_block" : "10.0.7.0/24",
      "subnet_display_name" : "fssnet"
    }
  },
  "Compute": {
    "Bastion": {
      "bastion_compute_display_name": "",
      "linux_os_version" : "7.6",
      "timezone" : "America/New_York",
      "bastion_user" : "opc",
      "compute_boot_volume_size_in_gb" : "100",
      "compute_instance_user" : "opc"
    },
    "AppTier":{
      "app_compute_display_name": "",
      "app_instance_count" : "1",
      "app_instance_shape" : "VM.Standard2.2",
      "env_prefix" : "ebsenv",
      "app_instance_listen_port" : "8000"
    },
    "DatabaseTier": {
      "database_compute_display_name": "",
      "db_hostname_prefix" : "dbdemo",
      "db_edition" : "ENTERPRISE_EDITION_EXTREME_PERFORMANCE",
      "db_license_model" : "LICENSE_INCLUDED",
      "db_version" : "18.0.0.0",
      "db_node_count" : "1",
      "db_instance_shape" : "VM.Standard2.4",
      "db_name" : "EBSCDB",
      "db_size_in_gb" : "256",
      "db_admin_password" : "QAed12_sd#1AS",
      "db_characterset" : "AL32UTF8",
      "db_nls_characterset" : "AL16UTF16",
      "db_pdb_name" : "DUMMYPDB"
    }
  },
  "LoadBalancer": {
    "public_load_balancer_display_name": "",
    "load_balancer_shape" : "100Mbps",
    "load_balancer_listen_port" : "8000",
    "public_load_balancer_hostname" : "pub.ebs.example.com"
  }
}
);
*/
