const { queryRef, executeQuery, validateArgsWithOptions, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'smart-tourism-abf26-service',
  location: 'asia-southeast1'
};
exports.connectorConfig = connectorConfig;

const listPlacesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPlaces');
}
listPlacesRef.operationName = 'ListPlaces';
exports.listPlacesRef = listPlacesRef;

exports.listPlaces = function listPlaces(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listPlacesRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;
