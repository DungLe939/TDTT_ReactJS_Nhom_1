import { ListCategoriesData, ListFoodsData, ListFoodsVariables, ListFoodsByCategoryData, ListFoodsByCategoryVariables, GetFoodDetailData, GetFoodDetailVariables, GetShopDetailData, GetShopDetailVariables, ListShopsData, ListShopsVariables, CreateCategoryData, CreateCategoryVariables, CreateShopData, CreateShopVariables, CreateFoodItemData, CreateFoodItemVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useListCategories(options?: useDataConnectQueryOptions<ListCategoriesData>): UseDataConnectQueryResult<ListCategoriesData, undefined>;
export function useListCategories(dc: DataConnect, options?: useDataConnectQueryOptions<ListCategoriesData>): UseDataConnectQueryResult<ListCategoriesData, undefined>;

export function useListFoods(vars?: ListFoodsVariables, options?: useDataConnectQueryOptions<ListFoodsData>): UseDataConnectQueryResult<ListFoodsData, ListFoodsVariables>;
export function useListFoods(dc: DataConnect, vars?: ListFoodsVariables, options?: useDataConnectQueryOptions<ListFoodsData>): UseDataConnectQueryResult<ListFoodsData, ListFoodsVariables>;

export function useListFoodsByCategory(vars: ListFoodsByCategoryVariables, options?: useDataConnectQueryOptions<ListFoodsByCategoryData>): UseDataConnectQueryResult<ListFoodsByCategoryData, ListFoodsByCategoryVariables>;
export function useListFoodsByCategory(dc: DataConnect, vars: ListFoodsByCategoryVariables, options?: useDataConnectQueryOptions<ListFoodsByCategoryData>): UseDataConnectQueryResult<ListFoodsByCategoryData, ListFoodsByCategoryVariables>;

export function useGetFoodDetail(vars: GetFoodDetailVariables, options?: useDataConnectQueryOptions<GetFoodDetailData>): UseDataConnectQueryResult<GetFoodDetailData, GetFoodDetailVariables>;
export function useGetFoodDetail(dc: DataConnect, vars: GetFoodDetailVariables, options?: useDataConnectQueryOptions<GetFoodDetailData>): UseDataConnectQueryResult<GetFoodDetailData, GetFoodDetailVariables>;

export function useGetShopDetail(vars: GetShopDetailVariables, options?: useDataConnectQueryOptions<GetShopDetailData>): UseDataConnectQueryResult<GetShopDetailData, GetShopDetailVariables>;
export function useGetShopDetail(dc: DataConnect, vars: GetShopDetailVariables, options?: useDataConnectQueryOptions<GetShopDetailData>): UseDataConnectQueryResult<GetShopDetailData, GetShopDetailVariables>;

export function useListShops(vars?: ListShopsVariables, options?: useDataConnectQueryOptions<ListShopsData>): UseDataConnectQueryResult<ListShopsData, ListShopsVariables>;
export function useListShops(dc: DataConnect, vars?: ListShopsVariables, options?: useDataConnectQueryOptions<ListShopsData>): UseDataConnectQueryResult<ListShopsData, ListShopsVariables>;

export function useCreateCategory(options?: useDataConnectMutationOptions<CreateCategoryData, FirebaseError, CreateCategoryVariables>): UseDataConnectMutationResult<CreateCategoryData, CreateCategoryVariables>;
export function useCreateCategory(dc: DataConnect, options?: useDataConnectMutationOptions<CreateCategoryData, FirebaseError, CreateCategoryVariables>): UseDataConnectMutationResult<CreateCategoryData, CreateCategoryVariables>;

export function useCreateShop(options?: useDataConnectMutationOptions<CreateShopData, FirebaseError, CreateShopVariables>): UseDataConnectMutationResult<CreateShopData, CreateShopVariables>;
export function useCreateShop(dc: DataConnect, options?: useDataConnectMutationOptions<CreateShopData, FirebaseError, CreateShopVariables>): UseDataConnectMutationResult<CreateShopData, CreateShopVariables>;

export function useCreateFoodItem(options?: useDataConnectMutationOptions<CreateFoodItemData, FirebaseError, CreateFoodItemVariables>): UseDataConnectMutationResult<CreateFoodItemData, CreateFoodItemVariables>;
export function useCreateFoodItem(dc: DataConnect, options?: useDataConnectMutationOptions<CreateFoodItemData, FirebaseError, CreateFoodItemVariables>): UseDataConnectMutationResult<CreateFoodItemData, CreateFoodItemVariables>;
