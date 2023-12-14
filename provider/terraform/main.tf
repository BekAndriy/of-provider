## Create a Resource Group for Storage
resource "azurerm_resource_group" "rg_apps_front_end" {
  location = var.deploy_location
  name     = "rg-${var.name}-${var.env}"
}


resource "azurerm_storage_account" "sa_apps_front_end" {
  name     = "sa${var.name}${var.env}"
  location = azurerm_resource_group.rg_apps_front_end.location

  account_replication_type  = "LRS"
  account_tier              = "Standard"
  account_kind              = "StorageV2"
  resource_group_name       = azurerm_resource_group.rg_apps_front_end.name
  enable_https_traffic_only = false

  static_website {
    index_document     = "index.html"
    error_404_document = "index.html"
  }
}
