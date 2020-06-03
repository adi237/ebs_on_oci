
#Authentication
compartment_ocid = "ocid1.compartment.oc1..aaaaaaaa4cmhrwn76aralhu2g7dfqhmv4ygyzfg6uitdz6muiaofwrpn74yq"
region = "us-ashburn-1"

### SSH Keys for apps and db 
ssh_public_key = "./keys/ssh_public_key"
ssh_private_key = "./keys/ssh_private_key"

### Public/private keys used on the bastion instance 
bastion_ssh_public_key = "./keys/bastion_ssh_public_key"
bastion_ssh_private_key = "./keys/bastion_ssh_private_key"

#VCN
vcn_cidr = "10.0.0.0/16" 
vcn_displayname = "ebsvcn" 
vcn_dns_label = "ebsvcn" 

#Gateways
int_gateway_displayname = "igateway" 
nat_gateway_displayname = "natgateway" 
srv_gateway_displayname = "servicegateway" 
drg_displayname = "drg" 
drg_att_displayname = "drgatt" 

#SecurityList
bastionseclist_displayname = "bastionseclist" 
dbseclist_displayname = "dbseclist" 
appseclist_displayname = "appseclist" 
publbseclist_displayname = "publbseclist" 

#RouteTable
bastion_displayname_rt = "ebsbastionrt" 
database_displayname_rt = "ebsdbroute" 
app_displayname_rt = "ebsapproute" 
fss_displayname_rt = "fssroute" 
drg_displayname_rt = "drgroute" 

#Subnets
bastion_subnet_cidr_block = "10.0.4.0/24" 
bastion_subnet_display_name = "bastionnet" 
app_subnet_cidr_block = "10.0.3.0/24" 
app_subnet_display_name = "appnet" 
public_lb_subnet_cidr_block = "10.0.5.0/24" 
public_lb_subnet_display_name = "lbsubnetpub" 
database_subnet_cidr_block = "10.0.1.0/24" 
database_subnet_display_name = "dbnet" 
filestorage_subnet_cidr_block = "10.0.7.0/24" 
filestorage_subnet_display_name = "fssnet" 
private_lb_subnet_cidr_block = "10.0.6.0/24" 
private_lb_subnet_display_name = "lbsubnetprv" 
backup_subnet_cidr_block = "10.0.2.0/24" 
backup_subnet_display_name = "backupsubnet" 

#Compute
AD = ["1","2"] 
bastion_compute_display_name = "BastionTest" 
linux_os_version = "7.7" 
timezone = "America/New_York" 
bastion_user = "opc" 
compute_boot_volume_size_in_gb = "100" 
compute_instance_user = "opc" 
app_compute_display_name = "AppTest" 
app_instance_count = "1" 
app_instance_shape = "VM.Standard2.2" 
env_prefix = "ebsenv" 
app_instance_listen_port = "8000" 
enable_autoscaling_pools = "false" 
database_compute_display_name = "DatabaseTest" 
db_hostname_prefix = "dbdemo" 
db_edition = "ENTERPRISE_EDITION_EXTREME_PERFORMANCE" 
db_license_model = "LICENSE_INCLUDED" 
db_version = "18.0.0.0" 
db_node_count = "1" 
db_instance_shape = "VM.Standard2.4" 
db_name = "EBSCDB" 
db_size_in_gb = "256" 
db_admin_password = "QAed12_sd#1AS" 
db_characterset = "AL32UTF8" 
db_nls_characterset = "AL16UTF16" 
db_pdb_name = "DUMMYPDB" 

#LoadBalancer
public_load_balancer_display_name = "PubLB" 
private_load_balancer_display_name = "PrvLb" 
load_balancer_shape = "100Mbps" 
load_balancer_listen_port = "8000" 
public_load_balancer_hostname = "pub.ebs.example.com" 
private_load_balancer_hostname = "pri.ebs.example.com" 

##### Other Hardcoded Variables Not Coming From UI #####

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
fss_limit_size_in_gb = "500"
