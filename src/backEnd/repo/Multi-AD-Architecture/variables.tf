#Environment Variables

variable "region" {}
variable "vcn_cidr" {}
variable "bastion_ssh_public_key" {}
variable "bastion_ssh_private_key" {}
variable "ssh_public_key" {}
variable "ssh_private_key" {}

### Displaynames
variable "vcn_displayname" {}
variable "int_gateway_displayname" {}
variable "nat_gateway_displayname" {}
variable "srv_gateway_displayname" {}
variable "drg_displayname" {}
variable "drg_att_displayname" {}

# Custom Display Names
variable "bastion_compute_display_name" {}
variable "app_compute_display_name" {}
variable "database_compute_display_name" {}
variable "public_load_balancer_display_name" {}
variable "private_load_balancer_display_name" {}
variable "bastion_subnet_display_name" {}
variable "app_subnet_display_name" {}
variable "public_lb_subnet_display_name" {}
variable "database_subnet_display_name" {}
variable "filestorage_subnet_display_name" {}
variable "private_lb_subnet_display_name" {}
variable "backup_subnet_display_name" {}

### Network Variables
variable "bastion_subnet_cidr_block" {}
variable "app_subnet_cidr_block" {}
variable "public_lb_subnet_cidr_block" {}
variable "private_lb_subnet_cidr_block" {}
variable "database_subnet_cidr_block" {}
variable "filestorage_subnet_cidr_block" {}
variable "backup_subnet_cidr_block" {}
# variable "onpremises_network_cidr_block" {}

### EBS Variables
variable "env_prefix" {}
variable "app_instance_count" {}
variable "app_instance_shape" {}
variable "compute_boot_volume_size_in_gb" {}
variable "app_instance_listen_port" {}
variable "fss_limit_size_in_gb" {}
variable "compute_instance_user" {}
variable "bastion_user" {}
variable "fss_primary_mount_path" {}
variable "timezone" {}

### Instances Variables
variable "bastion_instance_shape" {
    default = "VM.Standard2.1"
}
variable "InstanceOS" {
    description = "Operating system for compute instances"
    default = "Oracle Linux"
}

variable "linux_os_version" {
    description = "Operating system version for compute instances except NAT"
    default = "7.7"
}

#Local Variables
variable "AD" {
    description = "Availbility domain number"
    type        = "list"
}

### Load Balancer Variables
variable "load_balancer_shape" {}
variable "load_balancer_listen_port" {}
variable "private_load_balancer_hostname" {}
variable "public_load_balancer_hostname" {}

### Database Variables
variable "db_name" {}
variable "db_characterset" {}
variable "db_instance_shape" {}
variable "db_pdb_name" {}
variable "db_edition" {}
variable "db_size_in_gb" {}
variable "db_license_model" {}
variable "db_nls_characterset" {}
variable "db_node_count" {}
variable "db_admin_password" {}
variable "db_version" {}

### WAF Variables
variable "waas_policy_display_name" {}
variable "public_allow_url" {}
variable "whitelist" {
  type    = "list"
}
variable "enable_waas" {}

### Autoscale Variables
variable "enable_autoscaling_pools" {}
variable "autoscale_displayName" {}
variable "initialCapacity" {}
variable "maxCapacity" {}
variable "minCapacity" {}
variable "scaleUpCPUthreshold" {}
variable "scaleInCPUthreshold" {}

### Other
variable "bastion_displayname_rt" {}
variable "database_displayname_rt" {}
variable "app_displayname_rt" {}
variable "fss_displayname_rt" {}
variable "drg_displayname_rt" {}


# -AT- : search for changes.
