variable "deploy_location" {
  type        = string
  default     = "northeurope"
  description = "The Azure Region in which all resources in this example should be created."
}

variable "name" {
  type        = string
  default     = "ofprov001"
  description = "Base name for resources"
}

variable "env" {
  type        = string
  default     = "dev"
  description = "Environment name"
}
