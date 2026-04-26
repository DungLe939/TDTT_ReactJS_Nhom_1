# Generated React README
This README will guide you through the process of using the generated React SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `JavaScript README`, you can find it at [`dataconnect-generated/README.md`](../README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

You can use this generated SDK by importing from the package `@dataconnect/generated/react` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#react).

# Table of Contents
- [**Overview**](#generated-react-readme)
- [**TanStack Query Firebase & TanStack React Query**](#tanstack-query-firebase-tanstack-react-query)
  - [*Package Installation*](#installing-tanstack-query-firebase-and-tanstack-react-query-packages)
  - [*Configuring TanStack Query*](#configuring-tanstack-query)
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

# TanStack Query Firebase & TanStack React Query
This SDK provides [React](https://react.dev/) hooks generated specific to your application, for the operations found in the connector `example`. These hooks are generated using [TanStack Query Firebase](https://react-query-firebase.invertase.dev/) by our partners at Invertase, a library built on top of [TanStack React Query v5](https://tanstack.com/query/v5/docs/framework/react/overview).

***You do not need to be familiar with Tanstack Query or Tanstack Query Firebase to use this SDK.*** However, you may find it useful to learn more about them, as they will empower you as a user of this Generated React SDK.

## Installing TanStack Query Firebase and TanStack React Query Packages
In order to use the React generated SDK, you must install the `TanStack React Query` and `TanStack Query Firebase` packages.
```bash
npm i --save @tanstack/react-query @tanstack-query-firebase/react
```
```bash
npm i --save firebase@latest # Note: React has a peer dependency on ^11.3.0
```

You can also follow the installation instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#tanstack-install), or the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/react) and [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/installation).

## Configuring TanStack Query
In order to use the React generated SDK in your application, you must wrap your application's component tree in a `QueryClientProvider` component from TanStack React Query. None of your generated React SDK hooks will work without this provider.

```javascript
import { QueryClientProvider } from '@tanstack/react-query';

// Create a TanStack Query client instance
const queryClient = new QueryClient()

function App() {
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      <MyApplication />
    </QueryClientProvider>
  )
}
```

To learn more about `QueryClientProvider`, see the [TanStack React Query documentation](https://tanstack.com/query/latest/docs/framework/react/quick-start) and the [TanStack Query Firebase documentation](https://invertase.docs.page/tanstack-query-firebase/react#usage).

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`.

You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#emulator-react-angular).

```javascript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) using the hooks provided from your generated React SDK.

# Queries

The React generated SDK provides Query hook functions that call and return [`useDataConnectQuery`](https://react-query-firebase.invertase.dev/react/data-connect/querying) hooks from TanStack Query Firebase.

Calling these hook functions will return a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and the most recent data returned by the Query, among other things. To learn more about these hooks and how to use them, see the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/react/data-connect/querying).

TanStack React Query caches the results of your Queries, so using the same Query hook function in multiple places in your application allows the entire application to automatically see updates to that Query's data.

Query hooks execute their Queries automatically when called, and periodically refresh, unless you change the `queryOptions` for the Query. To learn how to stop a Query from automatically executing, including how to make a query "lazy", see the [TanStack React Query documentation](https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries).

To learn more about TanStack React Query's Queries, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/queries).

## Using Query Hooks
Here's a general overview of how to use the generated Query hooks in your code:

- If the Query has no variables, the Query hook function does not require arguments.
- If the Query has any required variables, the Query hook function will require at least one argument: an object that contains all the required variables for the Query.
- If the Query has some required and some optional variables, only required variables are necessary in the variables argument object, and optional variables may be provided as well.
- If all of the Query's variables are optional, the Query hook function does not require any arguments.
- Query hook functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.
- Query hooks functions can be called with or without passing in an `options` argument of type `useDataConnectQueryOptions`. To learn more about the `options` argument, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/query-options).
  - ***Special case:***  If the Query has all optional variables and you would like to provide an `options` argument to the Query hook function without providing any variables, you must pass `undefined` where you would normally pass the Query's variables, and then may provide the `options` argument.

Below are examples of how to use the `example` connector's generated Query hook functions to execute each Query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#operations-react-angular).

## ListCategories
You can execute the `ListCategories` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListCategories(dc: DataConnect, options?: useDataConnectQueryOptions<ListCategoriesData>): UseDataConnectQueryResult<ListCategoriesData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListCategories(options?: useDataConnectQueryOptions<ListCategoriesData>): UseDataConnectQueryResult<ListCategoriesData, undefined>;
```

### Variables
The `ListCategories` Query has no variables.
### Return Type
Recall that calling the `ListCategories` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListCategories` Query is of type `ListCategoriesData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface ListCategoriesData {
  categories: ({
    id: UUIDString;
    name: string;
    slug: string;
  } & Category_Key)[];
}
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListCategories`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useListCategories } from '@dataconnect/generated/react'

export default function ListCategoriesComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListCategories();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListCategories(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListCategories(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListCategories(dataConnect, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.categories);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListFoods
You can execute the `ListFoods` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListFoods(dc: DataConnect, vars?: ListFoodsVariables, options?: useDataConnectQueryOptions<ListFoodsData>): UseDataConnectQueryResult<ListFoodsData, ListFoodsVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListFoods(vars?: ListFoodsVariables, options?: useDataConnectQueryOptions<ListFoodsData>): UseDataConnectQueryResult<ListFoodsData, ListFoodsVariables>;
```

### Variables
The `ListFoods` Query has an optional argument of type `ListFoodsVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListFoodsVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that calling the `ListFoods` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListFoods` Query is of type `ListFoodsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListFoods`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListFoodsVariables } from '@dataconnect/generated';
import { useListFoods } from '@dataconnect/generated/react'

export default function ListFoodsComponent() {
  // The `useListFoods` Query hook has an optional argument of type `ListFoodsVariables`:
  const listFoodsVars: ListFoodsVariables = {
    limit: ..., // optional
    offset: ..., // optional
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListFoods(listFoodsVars);
  // Variables can be defined inline as well.
  const query = useListFoods({ limit: ..., offset: ..., });
  // Since all variables are optional for this Query, you can omit the `ListFoodsVariables` argument.
  // (as long as you don't want to provide any `options`!)
  const query = useListFoods();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListFoods(dataConnect, listFoodsVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListFoods(listFoodsVars, options);
  // If you'd like to provide options without providing any variables, you must
  // pass `undefined` where you would normally pass the variables.
  const query = useListFoods(undefined, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListFoods(dataConnect, listFoodsVars /** or undefined */, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.foodItems);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListFoodsByCategory
You can execute the `ListFoodsByCategory` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListFoodsByCategory(dc: DataConnect, vars: ListFoodsByCategoryVariables, options?: useDataConnectQueryOptions<ListFoodsByCategoryData>): UseDataConnectQueryResult<ListFoodsByCategoryData, ListFoodsByCategoryVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListFoodsByCategory(vars: ListFoodsByCategoryVariables, options?: useDataConnectQueryOptions<ListFoodsByCategoryData>): UseDataConnectQueryResult<ListFoodsByCategoryData, ListFoodsByCategoryVariables>;
```

### Variables
The `ListFoodsByCategory` Query requires an argument of type `ListFoodsByCategoryVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListFoodsByCategoryVariables {
  categoryId: UUIDString;
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that calling the `ListFoodsByCategory` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListFoodsByCategory` Query is of type `ListFoodsByCategoryData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListFoodsByCategory`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListFoodsByCategoryVariables } from '@dataconnect/generated';
import { useListFoodsByCategory } from '@dataconnect/generated/react'

export default function ListFoodsByCategoryComponent() {
  // The `useListFoodsByCategory` Query hook requires an argument of type `ListFoodsByCategoryVariables`:
  const listFoodsByCategoryVars: ListFoodsByCategoryVariables = {
    categoryId: ..., 
    limit: ..., // optional
    offset: ..., // optional
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListFoodsByCategory(listFoodsByCategoryVars);
  // Variables can be defined inline as well.
  const query = useListFoodsByCategory({ categoryId: ..., limit: ..., offset: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListFoodsByCategory(dataConnect, listFoodsByCategoryVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListFoodsByCategory(listFoodsByCategoryVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListFoodsByCategory(dataConnect, listFoodsByCategoryVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.foodItems);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## GetFoodDetail
You can execute the `GetFoodDetail` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetFoodDetail(dc: DataConnect, vars: GetFoodDetailVariables, options?: useDataConnectQueryOptions<GetFoodDetailData>): UseDataConnectQueryResult<GetFoodDetailData, GetFoodDetailVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetFoodDetail(vars: GetFoodDetailVariables, options?: useDataConnectQueryOptions<GetFoodDetailData>): UseDataConnectQueryResult<GetFoodDetailData, GetFoodDetailVariables>;
```

### Variables
The `GetFoodDetail` Query requires an argument of type `GetFoodDetailVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface GetFoodDetailVariables {
  id: UUIDString;
}
```
### Return Type
Recall that calling the `GetFoodDetail` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetFoodDetail` Query is of type `GetFoodDetailData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetFoodDetail`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, GetFoodDetailVariables } from '@dataconnect/generated';
import { useGetFoodDetail } from '@dataconnect/generated/react'

export default function GetFoodDetailComponent() {
  // The `useGetFoodDetail` Query hook requires an argument of type `GetFoodDetailVariables`:
  const getFoodDetailVars: GetFoodDetailVariables = {
    id: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetFoodDetail(getFoodDetailVars);
  // Variables can be defined inline as well.
  const query = useGetFoodDetail({ id: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetFoodDetail(dataConnect, getFoodDetailVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetFoodDetail(getFoodDetailVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetFoodDetail(dataConnect, getFoodDetailVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.foodItem);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## GetShopDetail
You can execute the `GetShopDetail` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetShopDetail(dc: DataConnect, vars: GetShopDetailVariables, options?: useDataConnectQueryOptions<GetShopDetailData>): UseDataConnectQueryResult<GetShopDetailData, GetShopDetailVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetShopDetail(vars: GetShopDetailVariables, options?: useDataConnectQueryOptions<GetShopDetailData>): UseDataConnectQueryResult<GetShopDetailData, GetShopDetailVariables>;
```

### Variables
The `GetShopDetail` Query requires an argument of type `GetShopDetailVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface GetShopDetailVariables {
  id: UUIDString;
}
```
### Return Type
Recall that calling the `GetShopDetail` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetShopDetail` Query is of type `GetShopDetailData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetShopDetail`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, GetShopDetailVariables } from '@dataconnect/generated';
import { useGetShopDetail } from '@dataconnect/generated/react'

export default function GetShopDetailComponent() {
  // The `useGetShopDetail` Query hook requires an argument of type `GetShopDetailVariables`:
  const getShopDetailVars: GetShopDetailVariables = {
    id: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetShopDetail(getShopDetailVars);
  // Variables can be defined inline as well.
  const query = useGetShopDetail({ id: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetShopDetail(dataConnect, getShopDetailVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetShopDetail(getShopDetailVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetShopDetail(dataConnect, getShopDetailVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.shop);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListShops
You can execute the `ListShops` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListShops(dc: DataConnect, vars?: ListShopsVariables, options?: useDataConnectQueryOptions<ListShopsData>): UseDataConnectQueryResult<ListShopsData, ListShopsVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListShops(vars?: ListShopsVariables, options?: useDataConnectQueryOptions<ListShopsData>): UseDataConnectQueryResult<ListShopsData, ListShopsVariables>;
```

### Variables
The `ListShops` Query has an optional argument of type `ListShopsVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListShopsVariables {
  limit?: number | null;
  offset?: number | null;
}
```
### Return Type
Recall that calling the `ListShops` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListShops` Query is of type `ListShopsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListShops`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListShopsVariables } from '@dataconnect/generated';
import { useListShops } from '@dataconnect/generated/react'

export default function ListShopsComponent() {
  // The `useListShops` Query hook has an optional argument of type `ListShopsVariables`:
  const listShopsVars: ListShopsVariables = {
    limit: ..., // optional
    offset: ..., // optional
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListShops(listShopsVars);
  // Variables can be defined inline as well.
  const query = useListShops({ limit: ..., offset: ..., });
  // Since all variables are optional for this Query, you can omit the `ListShopsVariables` argument.
  // (as long as you don't want to provide any `options`!)
  const query = useListShops();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListShops(dataConnect, listShopsVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListShops(listShopsVars, options);
  // If you'd like to provide options without providing any variables, you must
  // pass `undefined` where you would normally pass the variables.
  const query = useListShops(undefined, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListShops(dataConnect, listShopsVars /** or undefined */, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.shops);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

# Mutations

The React generated SDK provides Mutations hook functions that call and return [`useDataConnectMutation`](https://react-query-firebase.invertase.dev/react/data-connect/mutations) hooks from TanStack Query Firebase.

Calling these hook functions will return a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, and the most recent data returned by the Mutation, among other things. To learn more about these hooks and how to use them, see the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/react/data-connect/mutations).

Mutation hooks do not execute their Mutations automatically when called. Rather, after calling the Mutation hook function and getting a `UseMutationResult` object, you must call the `UseMutationResult.mutate()` function to execute the Mutation.

To learn more about TanStack React Query's Mutations, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/mutations).

## Using Mutation Hooks
Here's a general overview of how to use the generated Mutation hooks in your code:

- Mutation hook functions are not called with the arguments to the Mutation. Instead, arguments are passed to `UseMutationResult.mutate()`.
- If the Mutation has no variables, the `mutate()` function does not require arguments.
- If the Mutation has any required variables, the `mutate()` function will require at least one argument: an object that contains all the required variables for the Mutation.
- If the Mutation has some required and some optional variables, only required variables are necessary in the variables argument object, and optional variables may be provided as well.
- If all of the Mutation's variables are optional, the Mutation hook function does not require any arguments.
- Mutation hook functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.
- Mutation hooks also accept an `options` argument of type `useDataConnectMutationOptions`. To learn more about the `options` argument, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/mutations#mutation-side-effects).
  - `UseMutationResult.mutate()` also accepts an `options` argument of type `useDataConnectMutationOptions`.
  - ***Special case:*** If the Mutation has no arguments (or all optional arguments and you wish to provide none), and you want to pass `options` to `UseMutationResult.mutate()`, you must pass `undefined` where you would normally pass the Mutation's arguments, and then may provide the options argument.

Below are examples of how to use the `example` connector's generated Mutation hook functions to execute each Mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#operations-react-angular).

## CreateCategory
You can execute the `CreateCategory` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateCategory(options?: useDataConnectMutationOptions<CreateCategoryData, FirebaseError, CreateCategoryVariables>): UseDataConnectMutationResult<CreateCategoryData, CreateCategoryVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateCategory(dc: DataConnect, options?: useDataConnectMutationOptions<CreateCategoryData, FirebaseError, CreateCategoryVariables>): UseDataConnectMutationResult<CreateCategoryData, CreateCategoryVariables>;
```

### Variables
The `CreateCategory` Mutation requires an argument of type `CreateCategoryVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface CreateCategoryVariables {
  name: string;
  slug: string;
}
```
### Return Type
Recall that calling the `CreateCategory` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateCategory` Mutation is of type `CreateCategoryData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateCategoryData {
  category_insert: Category_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateCategory`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateCategoryVariables } from '@dataconnect/generated';
import { useCreateCategory } from '@dataconnect/generated/react'

export default function CreateCategoryComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateCategory();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateCategory(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateCategory(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateCategory(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateCategory` Mutation requires an argument of type `CreateCategoryVariables`:
  const createCategoryVars: CreateCategoryVariables = {
    name: ..., 
    slug: ..., 
  };
  mutation.mutate(createCategoryVars);
  // Variables can be defined inline as well.
  mutation.mutate({ name: ..., slug: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createCategoryVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.category_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateShop
You can execute the `CreateShop` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateShop(options?: useDataConnectMutationOptions<CreateShopData, FirebaseError, CreateShopVariables>): UseDataConnectMutationResult<CreateShopData, CreateShopVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateShop(dc: DataConnect, options?: useDataConnectMutationOptions<CreateShopData, FirebaseError, CreateShopVariables>): UseDataConnectMutationResult<CreateShopData, CreateShopVariables>;
```

### Variables
The `CreateShop` Mutation requires an argument of type `CreateShopVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
Recall that calling the `CreateShop` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateShop` Mutation is of type `CreateShopData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateShopData {
  shop_insert: Shop_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateShop`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateShopVariables } from '@dataconnect/generated';
import { useCreateShop } from '@dataconnect/generated/react'

export default function CreateShopComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateShop();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateShop(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateShop(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateShop(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateShop` Mutation requires an argument of type `CreateShopVariables`:
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
  mutation.mutate(createShopVars);
  // Variables can be defined inline as well.
  mutation.mutate({ externalId: ..., name: ..., address: ..., city: ..., rating: ..., coverImage: ..., url: ..., openTime: ..., closeTime: ..., priceMin: ..., priceMax: ..., priceDisplay: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createShopVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.shop_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateFoodItem
You can execute the `CreateFoodItem` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateFoodItem(options?: useDataConnectMutationOptions<CreateFoodItemData, FirebaseError, CreateFoodItemVariables>): UseDataConnectMutationResult<CreateFoodItemData, CreateFoodItemVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateFoodItem(dc: DataConnect, options?: useDataConnectMutationOptions<CreateFoodItemData, FirebaseError, CreateFoodItemVariables>): UseDataConnectMutationResult<CreateFoodItemData, CreateFoodItemVariables>;
```

### Variables
The `CreateFoodItem` Mutation requires an argument of type `CreateFoodItemVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
Recall that calling the `CreateFoodItem` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateFoodItem` Mutation is of type `CreateFoodItemData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateFoodItemData {
  foodItem_insert: FoodItem_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateFoodItem`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateFoodItemVariables } from '@dataconnect/generated';
import { useCreateFoodItem } from '@dataconnect/generated/react'

export default function CreateFoodItemComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateFoodItem();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateFoodItem(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateFoodItem(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateFoodItem(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateFoodItem` Mutation requires an argument of type `CreateFoodItemVariables`:
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
  mutation.mutate(createFoodItemVars);
  // Variables can be defined inline as well.
  mutation.mutate({ name: ..., description: ..., price: ..., priceDisplay: ..., imageUrl: ..., thumbnailUrl: ..., groupName: ..., isPopular: ..., totalLike: ..., shopId: ..., categoryId: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createFoodItemVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.foodItem_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

