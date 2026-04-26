# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useListCategories, useListFoods, useListFoodsByCategory, useGetFoodDetail, useGetShopDetail, useListShops, useCreateCategory, useCreateShop, useCreateFoodItem } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useListCategories();

const { data, isPending, isSuccess, isError, error } = useListFoods(listFoodsVars);

const { data, isPending, isSuccess, isError, error } = useListFoodsByCategory(listFoodsByCategoryVars);

const { data, isPending, isSuccess, isError, error } = useGetFoodDetail(getFoodDetailVars);

const { data, isPending, isSuccess, isError, error } = useGetShopDetail(getShopDetailVars);

const { data, isPending, isSuccess, isError, error } = useListShops(listShopsVars);

const { data, isPending, isSuccess, isError, error } = useCreateCategory(createCategoryVars);

const { data, isPending, isSuccess, isError, error } = useCreateShop(createShopVars);

const { data, isPending, isSuccess, isError, error } = useCreateFoodItem(createFoodItemVars);

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { listCategories, listFoods, listFoodsByCategory, getFoodDetail, getShopDetail, listShops, createCategory, createShop, createFoodItem } from '@dataconnect/generated';


// Operation ListCategories: 
const { data } = await ListCategories(dataConnect);

// Operation ListFoods:  For variables, look at type ListFoodsVars in ../index.d.ts
const { data } = await ListFoods(dataConnect, listFoodsVars);

// Operation ListFoodsByCategory:  For variables, look at type ListFoodsByCategoryVars in ../index.d.ts
const { data } = await ListFoodsByCategory(dataConnect, listFoodsByCategoryVars);

// Operation GetFoodDetail:  For variables, look at type GetFoodDetailVars in ../index.d.ts
const { data } = await GetFoodDetail(dataConnect, getFoodDetailVars);

// Operation GetShopDetail:  For variables, look at type GetShopDetailVars in ../index.d.ts
const { data } = await GetShopDetail(dataConnect, getShopDetailVars);

// Operation ListShops:  For variables, look at type ListShopsVars in ../index.d.ts
const { data } = await ListShops(dataConnect, listShopsVars);

// Operation CreateCategory:  For variables, look at type CreateCategoryVars in ../index.d.ts
const { data } = await CreateCategory(dataConnect, createCategoryVars);

// Operation CreateShop:  For variables, look at type CreateShopVars in ../index.d.ts
const { data } = await CreateShop(dataConnect, createShopVars);

// Operation CreateFoodItem:  For variables, look at type CreateFoodItemVars in ../index.d.ts
const { data } = await CreateFoodItem(dataConnect, createFoodItemVars);


```