# Azure Service Principal

## Create an Azure Service Principal

To assign roles to a service principal, you must have either a `Owner` or `User Access Admin Role` in your subscription.

```sh
az login
az account set --subscription="${SUBSCRIPTION_ID}"
az ad sp create-for-rbac \
--name ${SERVICE_PRINCIPAL_NAME} \
--role "Owner" \
--scopes="/subscriptions/${SUBSCRIPTION_ID}"
```

Information about the service principal will be shown after its creation.

```sh
{
  "appId": "${SERVICE_PRINCIPAL_APP_ID}",
  "displayName": "${SERVICE_PRINCIPAL_NAME}",
  "name": "http://${SERVICE_PRINCIPAL_NAME}",
  "password": "${SERVICE_PRINCIPAL_APP_KEY}",
  "tenant": "${SERVICE_PRINCIPAL_TENANT_ID}"
}
```

Copy the service principal's `appId` and `password` as you will need these for the `Service Principal App Id` and `Service Principal App Key` fields in your Fortis site deployment.