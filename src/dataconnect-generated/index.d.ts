import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Category_Key {
  id: UUIDString;
  __typename?: 'Category_Key';
}

export interface CrawlBatch_Key {
  id: UUIDString;
  __typename?: 'CrawlBatch_Key';
}

export interface CreateCategoryData {
  category_insert: Category_Key;
}

export interface CreateCategoryVariables {
  name: string;
  slug: string;
}

export interface CreateFoodItemData {
  foodItem_insert: FoodItem_Key;
}

export interface CreateFoodItemVariables {
  name: string;
  description?: string | null;
  price: number;
  priceDisplay?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  groupName?: string | null;
  isPopular: boolean;
  totalLike: number;
  shopId: UUIDString;
  categoryId: UUIDString;
}

export interface CreateShopData {
  shop_insert: Shop_Key;
}

export interface CreateShopVariables {
  externalId: string;
  name: string;
  address: string;
  city: string;
  rating?: number | null;
  coverImage?: string | null;
  url?: string | null;
  openTime?: string | null;
  closeTime?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  priceDisplay?: string | null;
  latitude: number;
  longitude: number;
}

export interface FoodItem_Key {
  id: UUIDString;
  __typename?: 'FoodItem_Key';
}

export interface GetFoodDetailData {
  foodItem?: {
    id: UUIDString;
    name: string;
    description?: string | null;
    price: number;
    priceDisplay?: string | null;
    imageUrl?: string | null;
    thumbnailUrl?: string | null;
    groupName?: string | null;
    isPopular: boolean;
    totalLike: number;
    shop: {
      id: UUIDString;
      name: string;
      address: string;
      city: string;
      rating?: number | null;
      coverImage?: string | null;
      url: string;
      openTime?: string | null;
      closeTime?: string | null;
      priceMin?: number | null;
      priceMax?: number | null;
      priceDisplay?: string | null;
      latitude: number;
      longitude: number;
    } & Shop_Key;
      category: {
        id: UUIDString;
        name: string;
        slug: string;
      } & Category_Key;
  } & FoodItem_Key;
}

export interface GetFoodDetailVariables {
  id: UUIDString;
}

export interface GetShopDetailData {
  shop?: {
    id: UUIDString;
    externalId?: string | null;
    name: string;
    address: string;
    city: string;
    rating?: number | null;
    coverImage?: string | null;
    url: string;
    openTime?: string | null;
    closeTime?: string | null;
    priceMin?: number | null;
    priceMax?: number | null;
    priceDisplay?: string | null;
    latitude: number;
    longitude: number;
    foodItems_on_shop: ({
      id: UUIDString;
      name: string;
      description?: string | null;
      price: number;
      priceDisplay?: string | null;
      imageUrl?: string | null;
      thumbnailUrl?: string | null;
      groupName?: string | null;
      isPopular: boolean;
      totalLike: number;
      category: {
        id: UUIDString;
        name: string;
        slug: string;
      } & Category_Key;
    } & FoodItem_Key)[];
  } & Shop_Key;
}

export interface GetShopDetailVariables {
  id: UUIDString;
}

export interface ListAllShopsWithMenuData {
  shops: ({
    id: UUIDString;
    externalId?: string | null;
    name: string;
    address: string;
    city: string;
    rating?: number | null;
    coverImage?: string | null;
    url: string;
    openTime?: string | null;
    closeTime?: string | null;
    priceMin?: number | null;
    priceMax?: number | null;
    priceDisplay?: string | null;
    latitude: number;
    longitude: number;
    foodItems_on_shop: ({
      id: UUIDString;
      name: string;
      description?: string | null;
      price: number;
      priceDisplay?: string | null;
      imageUrl?: string | null;
      thumbnailUrl?: string | null;
      groupName?: string | null;
      isPopular: boolean;
      totalLike: number;
      category: {
        id: UUIDString;
        name: string;
        slug: string;
      } & Category_Key;
    } & FoodItem_Key)[];
  } & Shop_Key)[];
}

export interface ListCategoriesData {
  categories: ({
    id: UUIDString;
    name: string;
    slug: string;
  } & Category_Key)[];
}

export interface ListFoodsByCategoryData {
  foodItems: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    price: number;
    priceDisplay?: string | null;
    imageUrl?: string | null;
    thumbnailUrl?: string | null;
    isPopular: boolean;
    totalLike: number;
    shop: {
      id: UUIDString;
      name: string;
      rating?: number | null;
    } & Shop_Key;
      category: {
        id: UUIDString;
        name: string;
        slug: string;
      } & Category_Key;
  } & FoodItem_Key)[];
}

export interface ListFoodsByCategoryVariables {
  categoryId: UUIDString;
  limit?: number | null;
  offset?: number | null;
}

export interface ListFoodsData {
  foodItems: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    price: number;
    priceDisplay?: string | null;
    imageUrl?: string | null;
    thumbnailUrl?: string | null;
    groupName?: string | null;
    isPopular: boolean;
    totalLike: number;
    shop: {
      id: UUIDString;
      name: string;
      rating?: number | null;
      address: string;
    } & Shop_Key;
      category: {
        id: UUIDString;
        name: string;
        slug: string;
      } & Category_Key;
  } & FoodItem_Key)[];
}

export interface ListFoodsVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface ListShopsData {
  shops: ({
    id: UUIDString;
    name: string;
    address: string;
    city: string;
    rating?: number | null;
    coverImage?: string | null;
    priceDisplay?: string | null;
    openTime?: string | null;
    closeTime?: string | null;
    latitude: number;
    longitude: number;
  } & Shop_Key)[];
}

export interface ListShopsVariables {
  limit?: number | null;
  offset?: number | null;
}

export interface Shop_Key {
  id: UUIDString;
  __typename?: 'Shop_Key';
}

interface ListCategoriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCategoriesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListCategoriesData, undefined>;
  operationName: string;
}
export const listCategoriesRef: ListCategoriesRef;

export function listCategories(options?: ExecuteQueryOptions): QueryPromise<ListCategoriesData, undefined>;
export function listCategories(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListCategoriesData, undefined>;

interface ListFoodsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListFoodsVariables): QueryRef<ListFoodsData, ListFoodsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListFoodsVariables): QueryRef<ListFoodsData, ListFoodsVariables>;
  operationName: string;
}
export const listFoodsRef: ListFoodsRef;

export function listFoods(vars?: ListFoodsVariables, options?: ExecuteQueryOptions): QueryPromise<ListFoodsData, ListFoodsVariables>;
export function listFoods(dc: DataConnect, vars?: ListFoodsVariables, options?: ExecuteQueryOptions): QueryPromise<ListFoodsData, ListFoodsVariables>;

interface ListFoodsByCategoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListFoodsByCategoryVariables): QueryRef<ListFoodsByCategoryData, ListFoodsByCategoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListFoodsByCategoryVariables): QueryRef<ListFoodsByCategoryData, ListFoodsByCategoryVariables>;
  operationName: string;
}
export const listFoodsByCategoryRef: ListFoodsByCategoryRef;

export function listFoodsByCategory(vars: ListFoodsByCategoryVariables, options?: ExecuteQueryOptions): QueryPromise<ListFoodsByCategoryData, ListFoodsByCategoryVariables>;
export function listFoodsByCategory(dc: DataConnect, vars: ListFoodsByCategoryVariables, options?: ExecuteQueryOptions): QueryPromise<ListFoodsByCategoryData, ListFoodsByCategoryVariables>;

interface GetFoodDetailRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFoodDetailVariables): QueryRef<GetFoodDetailData, GetFoodDetailVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetFoodDetailVariables): QueryRef<GetFoodDetailData, GetFoodDetailVariables>;
  operationName: string;
}
export const getFoodDetailRef: GetFoodDetailRef;

export function getFoodDetail(vars: GetFoodDetailVariables, options?: ExecuteQueryOptions): QueryPromise<GetFoodDetailData, GetFoodDetailVariables>;
export function getFoodDetail(dc: DataConnect, vars: GetFoodDetailVariables, options?: ExecuteQueryOptions): QueryPromise<GetFoodDetailData, GetFoodDetailVariables>;

interface GetShopDetailRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetShopDetailVariables): QueryRef<GetShopDetailData, GetShopDetailVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetShopDetailVariables): QueryRef<GetShopDetailData, GetShopDetailVariables>;
  operationName: string;
}
export const getShopDetailRef: GetShopDetailRef;

export function getShopDetail(vars: GetShopDetailVariables, options?: ExecuteQueryOptions): QueryPromise<GetShopDetailData, GetShopDetailVariables>;
export function getShopDetail(dc: DataConnect, vars: GetShopDetailVariables, options?: ExecuteQueryOptions): QueryPromise<GetShopDetailData, GetShopDetailVariables>;

interface ListShopsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListShopsVariables): QueryRef<ListShopsData, ListShopsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListShopsVariables): QueryRef<ListShopsData, ListShopsVariables>;
  operationName: string;
}
export const listShopsRef: ListShopsRef;

export function listShops(vars?: ListShopsVariables, options?: ExecuteQueryOptions): QueryPromise<ListShopsData, ListShopsVariables>;
export function listShops(dc: DataConnect, vars?: ListShopsVariables, options?: ExecuteQueryOptions): QueryPromise<ListShopsData, ListShopsVariables>;

interface ListAllShopsWithMenuRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllShopsWithMenuData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllShopsWithMenuData, undefined>;
  operationName: string;
}
export const listAllShopsWithMenuRef: ListAllShopsWithMenuRef;

export function listAllShopsWithMenu(options?: ExecuteQueryOptions): QueryPromise<ListAllShopsWithMenuData, undefined>;
export function listAllShopsWithMenu(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAllShopsWithMenuData, undefined>;

interface CreateCategoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCategoryVariables): MutationRef<CreateCategoryData, CreateCategoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateCategoryVariables): MutationRef<CreateCategoryData, CreateCategoryVariables>;
  operationName: string;
}
export const createCategoryRef: CreateCategoryRef;

export function createCategory(vars: CreateCategoryVariables): MutationPromise<CreateCategoryData, CreateCategoryVariables>;
export function createCategory(dc: DataConnect, vars: CreateCategoryVariables): MutationPromise<CreateCategoryData, CreateCategoryVariables>;

interface CreateShopRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateShopVariables): MutationRef<CreateShopData, CreateShopVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateShopVariables): MutationRef<CreateShopData, CreateShopVariables>;
  operationName: string;
}
export const createShopRef: CreateShopRef;

export function createShop(vars: CreateShopVariables): MutationPromise<CreateShopData, CreateShopVariables>;
export function createShop(dc: DataConnect, vars: CreateShopVariables): MutationPromise<CreateShopData, CreateShopVariables>;

interface CreateFoodItemRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateFoodItemVariables): MutationRef<CreateFoodItemData, CreateFoodItemVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateFoodItemVariables): MutationRef<CreateFoodItemData, CreateFoodItemVariables>;
  operationName: string;
}
export const createFoodItemRef: CreateFoodItemRef;

export function createFoodItem(vars: CreateFoodItemVariables): MutationPromise<CreateFoodItemData, CreateFoodItemVariables>;
export function createFoodItem(dc: DataConnect, vars: CreateFoodItemVariables): MutationPromise<CreateFoodItemData, CreateFoodItemVariables>;

