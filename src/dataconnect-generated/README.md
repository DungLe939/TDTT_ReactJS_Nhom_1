# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListCategories*](#listcategories)
  - [*ListFoods*](#listfoods)
  - [*ListFoodsByCategory*](#listfoodsbycategory)
  - [*GetFoodDetail*](#getfooddetail)
  - [*GetShopDetail*](#getshopdetail)
  - [*ListShops*](#listshops)
- [**Mutations**](#mutations)
  - [*CreateCategory*](#createcategory)
  - [*CreateShop*](#createshop)
  - [*CreateFoodItem*](#createfooditem)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListCategories
You can execute the `ListCategories` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listCategories(options?: ExecuteQueryOptions): QueryPromise<ListCategoriesData, undefined>;

interface ListCategoriesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCategoriesData, undefined>;
}
export const listCategoriesRef: ListCategoriesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listCategories(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListCategoriesData, undefined>;

interface ListCategoriesRef {
  ...
  (dc: DataConnect): QueryRef<ListCategoriesData, undefined>;
}
export const listCategoriesRef: ListCategoriesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listCategoriesRef:
```typescript
const name = listCategoriesRef.operationName;
console.log(name);
```

### Variables
The `ListCategories` query has no variables.
### Return Type
Recall that executing the `ListCategories` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListCategoriesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListCategoriesData {
  categories: ({
    id: UUIDString;
    name: string;
    slug: string;
  } & Category_Key)[];
}
```
### Using `ListCategories`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listCategories } from '@dataconnect/generated';


// Call the `listCategories()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listCategories();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listCategories(dataConnect);

console.log(data.categories);

// Or, you can use the `Promise` API.
listCategories().then((response) => {
  const data = response.data;
  console.log(data.categories);
});
```

### Using `ListCategories`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listCategoriesRef } from '@dataconnect/generated';


// Call the `listCategoriesRef()` function to get a reference to the query.
const ref = listCategoriesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listCategoriesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.categories);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.categories);
});
```

## ListFoods
You can execute the `ListFoods` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listFoods(vars?: ListFoodsVariables, options?: ExecuteQueryOptions): QueryPromise<ListFoodsData, ListFoodsVariables>;

interface ListFoodsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListFoodsVariables): QueryRef<ListFoodsData, ListFoodsVariables>;
}
export const listFoodsRef: ListFoodsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listFoods(dc: DataConnect, vars?: ListFoodsVariables, options?: ExecuteQueryOptions): QueryPromise<ListFoodsData, ListFoodsVariables>;

interface ListFoodsRef {
  ...
  (dc: DataConnect, vars?: ListFoodsVariables): QueryRef<ListFoodsData, ListFoodsVariables>;
}
export const listFoodsRef: ListFoodsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listFoodsRef:
```typescript
const name = listFoodsRef.operationName;
console.log(name);
```

### Variables
The `ListFoods` query has an optional argument of type `ListFoodsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListFoodsVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `ListFoods` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListFoodsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
      lat?: number | null;
      lng?: number | null;
    } & Shop_Key;
      category: {
        id: UUIDString;
        name: string;
        slug: string;
      } & Category_Key;
  } & FoodItem_Key)[];
}
```
### Using `ListFoods`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listFoods, ListFoodsVariables } from '@dataconnect/generated';

// The `ListFoods` query has an optional argument of type `ListFoodsVariables`:
const listFoodsVars: ListFoodsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listFoods()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listFoods(listFoodsVars);
// Variables can be defined inline as well.
const { data } = await listFoods({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListFoodsVariables` argument.
const { data } = await listFoods();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listFoods(dataConnect, listFoodsVars);

console.log(data.foodItems);

// Or, you can use the `Promise` API.
listFoods(listFoodsVars).then((response) => {
  const data = response.data;
  console.log(data.foodItems);
});
```

### Using `ListFoods`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listFoodsRef, ListFoodsVariables } from '@dataconnect/generated';

// The `ListFoods` query has an optional argument of type `ListFoodsVariables`:
const listFoodsVars: ListFoodsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listFoodsRef()` function to get a reference to the query.
const ref = listFoodsRef(listFoodsVars);
// Variables can be defined inline as well.
const ref = listFoodsRef({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListFoodsVariables` argument.
const ref = listFoodsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listFoodsRef(dataConnect, listFoodsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.foodItems);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.foodItems);
});
```

## ListFoodsByCategory
You can execute the `ListFoodsByCategory` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listFoodsByCategory(vars: ListFoodsByCategoryVariables, options?: ExecuteQueryOptions): QueryPromise<ListFoodsByCategoryData, ListFoodsByCategoryVariables>;

interface ListFoodsByCategoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListFoodsByCategoryVariables): QueryRef<ListFoodsByCategoryData, ListFoodsByCategoryVariables>;
}
export const listFoodsByCategoryRef: ListFoodsByCategoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listFoodsByCategory(dc: DataConnect, vars: ListFoodsByCategoryVariables, options?: ExecuteQueryOptions): QueryPromise<ListFoodsByCategoryData, ListFoodsByCategoryVariables>;

interface ListFoodsByCategoryRef {
  ...
  (dc: DataConnect, vars: ListFoodsByCategoryVariables): QueryRef<ListFoodsByCategoryData, ListFoodsByCategoryVariables>;
}
export const listFoodsByCategoryRef: ListFoodsByCategoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listFoodsByCategoryRef:
```typescript
const name = listFoodsByCategoryRef.operationName;
console.log(name);
```

### Variables
The `ListFoodsByCategory` query requires an argument of type `ListFoodsByCategoryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListFoodsByCategoryVariables {
  categoryId: UUIDString;
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `ListFoodsByCategory` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListFoodsByCategoryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListFoodsByCategory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listFoodsByCategory, ListFoodsByCategoryVariables } from '@dataconnect/generated';

// The `ListFoodsByCategory` query requires an argument of type `ListFoodsByCategoryVariables`:
const listFoodsByCategoryVars: ListFoodsByCategoryVariables = {
  categoryId: ..., 
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listFoodsByCategory()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listFoodsByCategory(listFoodsByCategoryVars);
// Variables can be defined inline as well.
const { data } = await listFoodsByCategory({ categoryId: ..., limit: ..., offset: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listFoodsByCategory(dataConnect, listFoodsByCategoryVars);

console.log(data.foodItems);

// Or, you can use the `Promise` API.
listFoodsByCategory(listFoodsByCategoryVars).then((response) => {
  const data = response.data;
  console.log(data.foodItems);
});
```

### Using `ListFoodsByCategory`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listFoodsByCategoryRef, ListFoodsByCategoryVariables } from '@dataconnect/generated';

// The `ListFoodsByCategory` query requires an argument of type `ListFoodsByCategoryVariables`:
const listFoodsByCategoryVars: ListFoodsByCategoryVariables = {
  categoryId: ..., 
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listFoodsByCategoryRef()` function to get a reference to the query.
const ref = listFoodsByCategoryRef(listFoodsByCategoryVars);
// Variables can be defined inline as well.
const ref = listFoodsByCategoryRef({ categoryId: ..., limit: ..., offset: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listFoodsByCategoryRef(dataConnect, listFoodsByCategoryVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.foodItems);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.foodItems);
});
```

## GetFoodDetail
You can execute the `GetFoodDetail` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getFoodDetail(vars: GetFoodDetailVariables, options?: ExecuteQueryOptions): QueryPromise<GetFoodDetailData, GetFoodDetailVariables>;

interface GetFoodDetailRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFoodDetailVariables): QueryRef<GetFoodDetailData, GetFoodDetailVariables>;
}
export const getFoodDetailRef: GetFoodDetailRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getFoodDetail(dc: DataConnect, vars: GetFoodDetailVariables, options?: ExecuteQueryOptions): QueryPromise<GetFoodDetailData, GetFoodDetailVariables>;

interface GetFoodDetailRef {
  ...
  (dc: DataConnect, vars: GetFoodDetailVariables): QueryRef<GetFoodDetailData, GetFoodDetailVariables>;
}
export const getFoodDetailRef: GetFoodDetailRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getFoodDetailRef:
```typescript
const name = getFoodDetailRef.operationName;
console.log(name);
```

### Variables
The `GetFoodDetail` query requires an argument of type `GetFoodDetailVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetFoodDetailVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetFoodDetail` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetFoodDetailData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
    } & Shop_Key;
      category: {
        id: UUIDString;
        name: string;
        slug: string;
      } & Category_Key;
  } & FoodItem_Key;
}
```
### Using `GetFoodDetail`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getFoodDetail, GetFoodDetailVariables } from '@dataconnect/generated';

// The `GetFoodDetail` query requires an argument of type `GetFoodDetailVariables`:
const getFoodDetailVars: GetFoodDetailVariables = {
  id: ..., 
};

// Call the `getFoodDetail()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getFoodDetail(getFoodDetailVars);
// Variables can be defined inline as well.
const { data } = await getFoodDetail({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getFoodDetail(dataConnect, getFoodDetailVars);

console.log(data.foodItem);

// Or, you can use the `Promise` API.
getFoodDetail(getFoodDetailVars).then((response) => {
  const data = response.data;
  console.log(data.foodItem);
});
```

### Using `GetFoodDetail`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getFoodDetailRef, GetFoodDetailVariables } from '@dataconnect/generated';

// The `GetFoodDetail` query requires an argument of type `GetFoodDetailVariables`:
const getFoodDetailVars: GetFoodDetailVariables = {
  id: ..., 
};

// Call the `getFoodDetailRef()` function to get a reference to the query.
const ref = getFoodDetailRef(getFoodDetailVars);
// Variables can be defined inline as well.
const ref = getFoodDetailRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getFoodDetailRef(dataConnect, getFoodDetailVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.foodItem);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.foodItem);
});
```

## GetShopDetail
You can execute the `GetShopDetail` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getShopDetail(vars: GetShopDetailVariables, options?: ExecuteQueryOptions): QueryPromise<GetShopDetailData, GetShopDetailVariables>;

interface GetShopDetailRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetShopDetailVariables): QueryRef<GetShopDetailData, GetShopDetailVariables>;
}
export const getShopDetailRef: GetShopDetailRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getShopDetail(dc: DataConnect, vars: GetShopDetailVariables, options?: ExecuteQueryOptions): QueryPromise<GetShopDetailData, GetShopDetailVariables>;

interface GetShopDetailRef {
  ...
  (dc: DataConnect, vars: GetShopDetailVariables): QueryRef<GetShopDetailData, GetShopDetailVariables>;
}
export const getShopDetailRef: GetShopDetailRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getShopDetailRef:
```typescript
const name = getShopDetailRef.operationName;
console.log(name);
```

### Variables
The `GetShopDetail` query requires an argument of type `GetShopDetailVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetShopDetailVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetShopDetail` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetShopDetailData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetShopDetail`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getShopDetail, GetShopDetailVariables } from '@dataconnect/generated';

// The `GetShopDetail` query requires an argument of type `GetShopDetailVariables`:
const getShopDetailVars: GetShopDetailVariables = {
  id: ..., 
};

// Call the `getShopDetail()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getShopDetail(getShopDetailVars);
// Variables can be defined inline as well.
const { data } = await getShopDetail({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getShopDetail(dataConnect, getShopDetailVars);

console.log(data.shop);

// Or, you can use the `Promise` API.
getShopDetail(getShopDetailVars).then((response) => {
  const data = response.data;
  console.log(data.shop);
});
```

### Using `GetShopDetail`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getShopDetailRef, GetShopDetailVariables } from '@dataconnect/generated';

// The `GetShopDetail` query requires an argument of type `GetShopDetailVariables`:
const getShopDetailVars: GetShopDetailVariables = {
  id: ..., 
};

// Call the `getShopDetailRef()` function to get a reference to the query.
const ref = getShopDetailRef(getShopDetailVars);
// Variables can be defined inline as well.
const ref = getShopDetailRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getShopDetailRef(dataConnect, getShopDetailVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.shop);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.shop);
});
```

## ListShops
You can execute the `ListShops` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listShops(vars?: ListShopsVariables, options?: ExecuteQueryOptions): QueryPromise<ListShopsData, ListShopsVariables>;

interface ListShopsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListShopsVariables): QueryRef<ListShopsData, ListShopsVariables>;
}
export const listShopsRef: ListShopsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listShops(dc: DataConnect, vars?: ListShopsVariables, options?: ExecuteQueryOptions): QueryPromise<ListShopsData, ListShopsVariables>;

interface ListShopsRef {
  ...
  (dc: DataConnect, vars?: ListShopsVariables): QueryRef<ListShopsData, ListShopsVariables>;
}
export const listShopsRef: ListShopsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listShopsRef:
```typescript
const name = listShopsRef.operationName;
console.log(name);
```

### Variables
The `ListShops` query has an optional argument of type `ListShopsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListShopsVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that executing the `ListShops` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListShopsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
    lat?: number | null;
    lng?: number | null;
  } & Shop_Key)[];
}
```
### Using `ListShops`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listShops, ListShopsVariables } from '@dataconnect/generated';

// The `ListShops` query has an optional argument of type `ListShopsVariables`:
const listShopsVars: ListShopsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listShops()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listShops(listShopsVars);
// Variables can be defined inline as well.
const { data } = await listShops({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListShopsVariables` argument.
const { data } = await listShops();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listShops(dataConnect, listShopsVars);

console.log(data.shops);

// Or, you can use the `Promise` API.
listShops(listShopsVars).then((response) => {
  const data = response.data;
  console.log(data.shops);
});
```

### Using `ListShops`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listShopsRef, ListShopsVariables } from '@dataconnect/generated';

// The `ListShops` query has an optional argument of type `ListShopsVariables`:
const listShopsVars: ListShopsVariables = {
  limit: ..., // optional
  offset: ..., // optional
};

// Call the `listShopsRef()` function to get a reference to the query.
const ref = listShopsRef(listShopsVars);
// Variables can be defined inline as well.
const ref = listShopsRef({ limit: ..., offset: ..., });
// Since all variables are optional for this query, you can omit the `ListShopsVariables` argument.
const ref = listShopsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listShopsRef(dataConnect, listShopsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.shops);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.shops);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateCategory
You can execute the `CreateCategory` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createCategory(vars: CreateCategoryVariables): MutationPromise<CreateCategoryData, CreateCategoryVariables>;

interface CreateCategoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCategoryVariables): MutationRef<CreateCategoryData, CreateCategoryVariables>;
}
export const createCategoryRef: CreateCategoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createCategory(dc: DataConnect, vars: CreateCategoryVariables): MutationPromise<CreateCategoryData, CreateCategoryVariables>;

interface CreateCategoryRef {
  ...
  (dc: DataConnect, vars: CreateCategoryVariables): MutationRef<CreateCategoryData, CreateCategoryVariables>;
}
export const createCategoryRef: CreateCategoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createCategoryRef:
```typescript
const name = createCategoryRef.operationName;
console.log(name);
```

### Variables
The `CreateCategory` mutation requires an argument of type `CreateCategoryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateCategoryVariables {
  name: string;
  slug: string;
}
```
### Return Type
Recall that executing the `CreateCategory` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateCategoryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateCategoryData {
  category_insert: Category_Key;
}
```
### Using `CreateCategory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCategory, CreateCategoryVariables } from '@dataconnect/generated';

// The `CreateCategory` mutation requires an argument of type `CreateCategoryVariables`:
const createCategoryVars: CreateCategoryVariables = {
  name: ..., 
  slug: ..., 
};

// Call the `createCategory()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createCategory(createCategoryVars);
// Variables can be defined inline as well.
const { data } = await createCategory({ name: ..., slug: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createCategory(dataConnect, createCategoryVars);

console.log(data.category_insert);

// Or, you can use the `Promise` API.
createCategory(createCategoryVars).then((response) => {
  const data = response.data;
  console.log(data.category_insert);
});
```

### Using `CreateCategory`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createCategoryRef, CreateCategoryVariables } from '@dataconnect/generated';

// The `CreateCategory` mutation requires an argument of type `CreateCategoryVariables`:
const createCategoryVars: CreateCategoryVariables = {
  name: ..., 
  slug: ..., 
};

// Call the `createCategoryRef()` function to get a reference to the mutation.
const ref = createCategoryRef(createCategoryVars);
// Variables can be defined inline as well.
const ref = createCategoryRef({ name: ..., slug: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createCategoryRef(dataConnect, createCategoryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.category_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.category_insert);
});
```

## CreateShop
You can execute the `CreateShop` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createShop(vars: CreateShopVariables): MutationPromise<CreateShopData, CreateShopVariables>;

interface CreateShopRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateShopVariables): MutationRef<CreateShopData, CreateShopVariables>;
}
export const createShopRef: CreateShopRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createShop(dc: DataConnect, vars: CreateShopVariables): MutationPromise<CreateShopData, CreateShopVariables>;

interface CreateShopRef {
  ...
  (dc: DataConnect, vars: CreateShopVariables): MutationRef<CreateShopData, CreateShopVariables>;
}
export const createShopRef: CreateShopRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createShopRef:
```typescript
const name = createShopRef.operationName;
console.log(name);
```

### Variables
The `CreateShop` mutation requires an argument of type `CreateShopVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
}
```
### Return Type
Recall that executing the `CreateShop` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateShopData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateShopData {
  shop_insert: Shop_Key;
}
```
### Using `CreateShop`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createShop, CreateShopVariables } from '@dataconnect/generated';

// The `CreateShop` mutation requires an argument of type `CreateShopVariables`:
const createShopVars: CreateShopVariables = {
  externalId: ..., 
  name: ..., 
  address: ..., 
  city: ..., 
  rating: ..., // optional
  coverImage: ..., // optional
  url: ..., // optional
  openTime: ..., // optional
  closeTime: ..., // optional
  priceMin: ..., // optional
  priceMax: ..., // optional
  priceDisplay: ..., // optional
};

// Call the `createShop()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createShop(createShopVars);
// Variables can be defined inline as well.
const { data } = await createShop({ externalId: ..., name: ..., address: ..., city: ..., rating: ..., coverImage: ..., url: ..., openTime: ..., closeTime: ..., priceMin: ..., priceMax: ..., priceDisplay: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createShop(dataConnect, createShopVars);

console.log(data.shop_insert);

// Or, you can use the `Promise` API.
createShop(createShopVars).then((response) => {
  const data = response.data;
  console.log(data.shop_insert);
});
```

### Using `CreateShop`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createShopRef, CreateShopVariables } from '@dataconnect/generated';

// The `CreateShop` mutation requires an argument of type `CreateShopVariables`:
const createShopVars: CreateShopVariables = {
  externalId: ..., 
  name: ..., 
  address: ..., 
  city: ..., 
  rating: ..., // optional
  coverImage: ..., // optional
  url: ..., // optional
  openTime: ..., // optional
  closeTime: ..., // optional
  priceMin: ..., // optional
  priceMax: ..., // optional
  priceDisplay: ..., // optional
};

// Call the `createShopRef()` function to get a reference to the mutation.
const ref = createShopRef(createShopVars);
// Variables can be defined inline as well.
const ref = createShopRef({ externalId: ..., name: ..., address: ..., city: ..., rating: ..., coverImage: ..., url: ..., openTime: ..., closeTime: ..., priceMin: ..., priceMax: ..., priceDisplay: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createShopRef(dataConnect, createShopVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.shop_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.shop_insert);
});
```

## CreateFoodItem
You can execute the `CreateFoodItem` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createFoodItem(vars: CreateFoodItemVariables): MutationPromise<CreateFoodItemData, CreateFoodItemVariables>;

interface CreateFoodItemRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateFoodItemVariables): MutationRef<CreateFoodItemData, CreateFoodItemVariables>;
}
export const createFoodItemRef: CreateFoodItemRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createFoodItem(dc: DataConnect, vars: CreateFoodItemVariables): MutationPromise<CreateFoodItemData, CreateFoodItemVariables>;

interface CreateFoodItemRef {
  ...
  (dc: DataConnect, vars: CreateFoodItemVariables): MutationRef<CreateFoodItemData, CreateFoodItemVariables>;
}
export const createFoodItemRef: CreateFoodItemRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createFoodItemRef:
```typescript
const name = createFoodItemRef.operationName;
console.log(name);
```

### Variables
The `CreateFoodItem` mutation requires an argument of type `CreateFoodItemVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateFoodItem` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateFoodItemData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateFoodItemData {
  foodItem_insert: FoodItem_Key;
}
```
### Using `CreateFoodItem`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createFoodItem, CreateFoodItemVariables } from '@dataconnect/generated';

// The `CreateFoodItem` mutation requires an argument of type `CreateFoodItemVariables`:
const createFoodItemVars: CreateFoodItemVariables = {
  name: ..., 
  description: ..., // optional
  price: ..., 
  priceDisplay: ..., // optional
  imageUrl: ..., // optional
  thumbnailUrl: ..., // optional
  groupName: ..., // optional
  isPopular: ..., 
  totalLike: ..., 
  shopId: ..., 
  categoryId: ..., 
};

// Call the `createFoodItem()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createFoodItem(createFoodItemVars);
// Variables can be defined inline as well.
const { data } = await createFoodItem({ name: ..., description: ..., price: ..., priceDisplay: ..., imageUrl: ..., thumbnailUrl: ..., groupName: ..., isPopular: ..., totalLike: ..., shopId: ..., categoryId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createFoodItem(dataConnect, createFoodItemVars);

console.log(data.foodItem_insert);

// Or, you can use the `Promise` API.
createFoodItem(createFoodItemVars).then((response) => {
  const data = response.data;
  console.log(data.foodItem_insert);
});
```

### Using `CreateFoodItem`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createFoodItemRef, CreateFoodItemVariables } from '@dataconnect/generated';

// The `CreateFoodItem` mutation requires an argument of type `CreateFoodItemVariables`:
const createFoodItemVars: CreateFoodItemVariables = {
  name: ..., 
  description: ..., // optional
  price: ..., 
  priceDisplay: ..., // optional
  imageUrl: ..., // optional
  thumbnailUrl: ..., // optional
  groupName: ..., // optional
  isPopular: ..., 
  totalLike: ..., 
  shopId: ..., 
  categoryId: ..., 
};

// Call the `createFoodItemRef()` function to get a reference to the mutation.
const ref = createFoodItemRef(createFoodItemVars);
// Variables can be defined inline as well.
const ref = createFoodItemRef({ name: ..., description: ..., price: ..., priceDisplay: ..., imageUrl: ..., thumbnailUrl: ..., groupName: ..., isPopular: ..., totalLike: ..., shopId: ..., categoryId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createFoodItemRef(dataConnect, createFoodItemVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.foodItem_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.foodItem_insert);
});
```

