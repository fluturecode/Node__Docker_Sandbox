resource "aws_db_instance" "rds_db" {
  identifier        = var.identifier
  engine            = var.engine
  engine_version    = var.engine_version
  instance_class    = var.instance_class
  allocated_storage = var.allocated_storage
  storage_type      = var.storage_type
  storage_encrypted = var.storage_encrypted

  name     = var.database_name
  username = var.database_username
  password = var.database_password
  port     = var.port

  snapshot_identifier    = var.snapshot_identifier
  vpc_security_group_ids = var.security_group_ids
  multi_az               = var.multi_az
  publicly_accessible    = var.publicly_accessible

  apply_immediately           = var.apply_immediately
  maintenance_window          = var.maintenance_window
  skip_final_snapshot         = var.skip_final_snapshot
  copy_tags_to_snapshot       = true
  final_snapshot_identifier   = var.final_snapshot_identifier
  max_allocated_storage       = var.max_allocated_storage
  parameter_group_name        = var.parameter_group_name

  backup_retention_period = var.backup_retention_period
  backup_window           = var.backup_window
  deletion_protection     = var.deletion_protection

  tags = merge(
    var.tags,
    {
      "Name" = format("%s", var.identifier)
    },
  )
}