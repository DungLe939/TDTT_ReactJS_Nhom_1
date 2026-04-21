import { queryRef, executeQuery, validateArgsWithOptions, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'smart-tourism-abf26-service',
  location: 'asia-southeast1'
};
export const listPlacesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPlaces');
}
listPlacesRef.operationName = 'ListPlaces';

export function listPlaces(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listPlacesRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

