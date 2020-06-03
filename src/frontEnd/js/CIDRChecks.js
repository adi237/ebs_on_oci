const errorMessages = {
  "vcn": "Incorrect value. Make sure its in the following format: xxx.xxx.xxx.xxx/16-30",
  "subnet_vcn": "Incorrect value. Make sure the subnet CIDR is within the VCN CIDR range.",
  "subnet_subnet": "Incorrect value. Make sure 2 subnets don't overlap!"
}

function onChangeVCNCIDR(inputObj,parentId){
  var valid = validateVCNCIDR(inputObj.value);
  addStyles(valid,inputObj,parentId,"vcn");
}

function onChangeSubnetCIDR(inputObj,ancestorId,parentId){
  var returnObj = validateSubnetCIDR(inputObj.value,parentId);
  addStyles(returnObj.valid,inputObj,ancestorId,(returnObj.overlapWithVCNCIDR ? "subnet_subnet" : "subnet_vcn"));
}

function addStyles(valid,inputObj,parentId,errorMessage){
  var helperLabel = inputObj.parentElement.querySelector(".helper-text");
  var nextButton = document.getElementById(parentId).querySelector(".next-step");
  helperLabel.innerHTML = (errorMessage == "subnet_vcn") ? (errorMessages[errorMessage] + " VCN CIDR: " + window.configObj.VCN.vcn_cidr) : errorMessages[errorMessage];
  if(valid){
    helperLabel.style.display="none";
    inputObj.classList.add("valid");
    inputObj.classList.remove("invalid");
    nextButton.disabled = false;
  }else{
    helperLabel.style.display="";
    inputObj.classList.add("invalid");
    inputObj.classList.remove("valid");
    nextButton.disabled = true;
  }
}

function validateVCNCIDR(vcnCIDR){
  var ipSubnet = vcnCIDR.split("/");
  var ip = ipSubnet[0];
  var subnetMask = ipSubnet[1];
  var valid = true;
  var octets = ip.split(".");

  if(isNaN(subnetMask) || (parseInt(subnetMask) < 16 || parseInt(subnetMask) > 30))
    valid = false;

  if(octets.length != 4)
    valid = false;

  octets.forEach(function(digits){
      if(isNaN(digits) || parseInt(digits) < 0 || parseInt(digits) > 255)
        valid = false;
  });

  if(valid && vcnCIDR != "10.0.0.0/16"){
    for (var subnet in window.configObj.Subnets){
      window.configObj.Subnets[subnet]['subnet_cidr_block'] = "";
    }
  }

  return valid;
}

function validateSubnetCIDR(subnetCIDR,subnetName){
  var returnObj= {
    valid: true,
    overlapWithVCNCIDR: true
  }
  var vcnCIDR = window.configObj.VCN.vcn_cidr;

  if(!doSubnetsOverlap(vcnCIDR,subnetCIDR) || vcnCIDR == subnetCIDR){
    returnObj.valid = false;
    returnObj.overlapWithVCNCIDR=false;
  }

  for (var subnet in window.configObj.Subnets){
    if(window.configObj.Subnets[subnet]['subnet_cidr_block'] != "" && subnet != subnetName)
      if(doSubnetsOverlap(window.configObj.Subnets[subnet]['subnet_cidr_block'],subnetCIDR))
        returnObj.valid = false;
  }

  return returnObj;
}
