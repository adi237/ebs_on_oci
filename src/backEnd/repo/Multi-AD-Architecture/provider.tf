#Provider

variable "compartment_ocid" {}
variable "tenancy_ocid" {}
variable "user_ocid" {}
variable "fingerprint" {}
variable "private_key_path" {}

provider "oci" {
   tenancy_ocid = "${var.tenancy_ocid}"
   user_ocid = "${var.user_ocid}"
   fingerprint = "${var.fingerprint}"
   private_key_path = "${var.private_key_path}"
   region = "${var.region}"
   disable_auto_retries = "false"

   //version = "=3.30.0"
}
