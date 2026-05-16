const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'smart-tourism-abf26-service',
  location: 'asia-southeast1'
};
exports.connectorConfig = connectorConfig;

const createCategoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCategory', inputVars);
}
createCategoryRef.operationName = 'CreateCategory';
exports.createCategoryRef = createCategoryRef;

exports.createCategory = function createCategory(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createCategoryRef(dcInstance, inputVars));
}
;

const createShopRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateShop', inputVars);
}
createShopRef.operationName = 'CreateShop';
exports.createShopRef = createShopRef;

exports.createShop = function createShop(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createShopRef(dcInstance, inputVars));
}
;

const createFoodItemRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateFoodItem', inputVars);
}
createFoodItemRef.operationName = 'CreateFoodItem';
exports.createFoodItemRef = createFoodItemRef;

exports.createFoodItem = function createFoodItem(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createFoodItemRef(dcInstance, inputVars));
}
;

const upsertPlanCacheRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertPlanCache', inputVars);
}
upsertPlanCacheRef.operationName = 'UpsertPlanCache';
exports.upsertPlanCacheRef = upsertPlanCacheRef;

exports.upsertPlanCache = function upsertPlanCache(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertPlanCacheRef(dcInstance, inputVars));
}
;

const deletePlanCacheRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeletePlanCache', inputVars);
}
deletePlanCacheRef.operationName = 'DeletePlanCache';
exports.deletePlanCacheRef = deletePlanCacheRef;

exports.deletePlanCache = function deletePlanCache(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deletePlanCacheRef(dcInstance, inputVars));
}
;

const updateDayScoresRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateDayScores', inputVars);
}
updateDayScoresRef.operationName = 'UpdateDayScores';
exports.updateDayScoresRef = updateDayScoresRef;

exports.updateDayScores = function updateDayScores(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateDayScoresRef(dcInstance, inputVars));
}
;

const updateUsedCategoriesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateUsedCategories', inputVars);
}
updateUsedCategoriesRef.operationName = 'UpdateUsedCategories';
exports.updateUsedCategoriesRef = updateUsedCategoriesRef;

exports.updateUsedCategories = function updateUsedCategories(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateUsedCategoriesRef(dcInstance, inputVars));
}
;

const listCategoriesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCategories');
}
listCategoriesRef.operationName = 'ListCategories';
exports.listCategoriesRef = listCategoriesRef;

exports.listCategories = function listCategories(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listCategoriesRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listFoodsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListFoods', inputVars);
}
listFoodsRef.operationName = 'ListFoods';
exports.listFoodsRef = listFoodsRef;

exports.listFoods = function listFoods(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(listFoodsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listFoodsByCategoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListFoodsByCategory', inputVars);
}
listFoodsByCategoryRef.operationName = 'ListFoodsByCategory';
exports.listFoodsByCategoryRef = listFoodsByCategoryRef;

exports.listFoodsByCategory = function listFoodsByCategory(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listFoodsByCategoryRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const getFoodDetailRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetFoodDetail', inputVars);
}
getFoodDetailRef.operationName = 'GetFoodDetail';
exports.getFoodDetailRef = getFoodDetailRef;

exports.getFoodDetail = function getFoodDetail(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getFoodDetailRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const getShopDetailRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetShopDetail', inputVars);
}
getShopDetailRef.operationName = 'GetShopDetail';
exports.getShopDetailRef = getShopDetailRef;

exports.getShopDetail = function getShopDetail(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getShopDetailRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listShopsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListShops', inputVars);
}
listShopsRef.operationName = 'ListShops';
exports.listShopsRef = listShopsRef;

exports.listShops = function listShops(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, false);
  return executeQuery(listShopsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listAllShopsWithMenuRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllShopsWithMenu');
}
listAllShopsWithMenuRef.operationName = 'ListAllShopsWithMenu';
exports.listAllShopsWithMenuRef = listAllShopsWithMenuRef;

exports.listAllShopsWithMenu = function listAllShopsWithMenu(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listAllShopsWithMenuRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const getPlanCacheRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPlanCache', inputVars);
}
getPlanCacheRef.operationName = 'GetPlanCache';
exports.getPlanCacheRef = getPlanCacheRef;

exports.getPlanCache = function getPlanCache(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getPlanCacheRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;
