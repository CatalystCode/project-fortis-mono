#!/usr/bin/env bash

readonly graphql_service_host="$1"
readonly blob_account_name="$2"
readonly blob_account_key="$3"
readonly blob_container_name="$4"
readonly fortis_interface_host="$5"
readonly aad_client="$6"
readonly mapbox_tile_layer_url="$7"
readonly latest_version="$8"

# setup
if ! (command -v jq >/dev/null); then sudo apt-get -qq install -y jq; fi
if ! (command -v npm >/dev/null); then curl -sL 'https://deb.nodesource.com/setup_8.x' | sudo -E bash -; sudo apt-get -qq install -y nodejs; fi

readonly install_dir="$(mktemp -d /tmp/fortis-interfaces-XXXXXX)"
pushd "${install_dir}"

wget "https://github.com/CatalystCode/project-fortis/archive/${latest_version}.tar.gz"
tar xf "${latest_version}.tar.gz" "project-fortis-${latest_version}/project-fortis-interfaces" --strip-components=2

npm install

# add site root to package.json so that the frontend build can include the
# correct relative links to resources like js, css, static files, etc.
readonly package_json="$(mktemp)"
jq --arg homepage "$fortis_interface_host" ". + {homepage: \$homepage}" > "$package_json" < package.json
mv "$package_json" ./package.json

# build the frontend
REACT_APP_SERVICE_HOST="${graphql_service_host}" \
REACT_APP_AD_CLIENT_ID="${aad_client}" \
REACT_APP_MAPBOX_TILE_LAYER_URL="${mapbox_tile_layer_url}" \
npm run build

# deploy the frontend to blob storage
az storage container create \
  --account-key "$blob_account_key" \
  --account-name "$blob_account_name" \
  --name "$blob_container_name" \
  --public-access "container"
az storage blob upload-batch \
  --account-key "$blob_account_key" \
  --account-name "$blob_account_name" \
  --destination "$blob_container_name" \
  --source "./build"

# cleanup
popd
