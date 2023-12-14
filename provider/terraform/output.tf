output "location" {
  description = "The Azure region"
  value       = azurerm_resource_group.rg_apps_front_end.location
}

output "storage_account" {
  description = "Storage account for Profiles"
  value       = azurerm_storage_account.sa_apps_front_end.name
}

output "azurerm_static_website_url" {
  description = "Static website URL"
  value       = azurerm_storage_account.sa_apps_front_end.primary_web_host
}
