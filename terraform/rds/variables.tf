variable "allocated_storage" {
  description = "Initial allocated storage for the DB"
  default     = "20"
}

variable "apply_immediately" {
  description = "Instructs RDS to apply changes immediately or during the next maintenance window"
  default     = true
}

variable "backup_window" {
  description = "Daily backup window for the DB instance in UTC time 00:00-00:00"
  default     = "09:30-10:00"
}

variable "backup_retention_period" {
  description = "Number of days DB backups are kept being being deleted"
  default     = "14"
}

variable "database_name" {
  description = "The name of the database created when the RDS instance is created"
}

variable "database_password" {
  description = "Password for the master DB user"
}

variable "database_username" {
  description = "Username for the master DB user"
}

variable "deletion_protection" {
  description = "Blocks deleting the RDS instance if enabled"
  default     = false
}

variable "engine" {
  description = "DB Engine (ex. postgres | mysql)"
}

variable "engine_version" {
  description = "Version of the DB engine (ex.5.6)"
}

variable "final_snapshot_identifier" {
  description = "Identifier used for the final snapshop upon deletion of the DB instance"
}

variable "identifier" {
  description = "Label for the RDS instance in the AWS dashboard"
}

variable "instance_class" {
  description = "Instance class used for the DB (ex. db.t3.micro)"
  default     = "db.t3.micro"
}

variable "maintenance_window" {
  description = "Weekly window to perform AWS scheduled maintenance (ex. Mon:00:00-Mon:03:00) in UTC"
  default     = "Sun:06:00-Sun:09:00"
}

variable "max_allocated_storage" {
  description = "Maximum allocated storage for the DB instance"
  default     = "50"
}

variable "multi_az" {
  description = "Sets the RDS instance to be in multi-az mode for high availability"
  default     = false
}

variable "parameter_group_name" {
  description = "Name of the DB parameter group to associate (ex. default.postgres11)"
}

variable "port" {
  description = "Port the RDS instance allows connections on"
}

variable "publicly_accessible" {
  description = "Sets the RDS instance to be publically accessible"
  default    = false
}

variable "security_group_ids" {
  description = "List of additional VPC security groups to associate"
  default     = []
}

variable "skip_final_snapshot" {
  description = "Determines whether a final DB snapshot is created before the DB instance is deleted"
  default     = false
}

variable "snapshot_identifier" {
  description = "Specifies whether or not to create this database from a snapshot. This correlates to the snapshot ID you'd find in the RDS console, e.g: rds:production-2015-06-26-06-05."
  default     = ""
}

variable "storage_encrypted" {
  description = "Specifies whether the DB instance is encrypted"
  default     = true
}

variable "storage_type" {
  description = "standard (magnetic), gp2 (general purpose SSD), or io1 (provisioned IOPS SSD)"
  default     = "gp2"
}

variable "tags" {
  description = "Map of tags to assign to the RDS instance"
}
