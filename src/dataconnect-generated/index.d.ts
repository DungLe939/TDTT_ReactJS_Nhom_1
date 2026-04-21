import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Itinerary_Key {
  id: UUIDString;
  __typename?: 'Itinerary_Key';
}

export interface ListPlacesData {
  places: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    city?: string | null;
    lat?: number | null;
    lng?: number | null;
  } & Place_Key)[];
}

export interface Place_Key {
  id: UUIDString;
  __typename?: 'Place_Key';
}

export interface Restaurant_Key {
  id: UUIDString;
  __typename?: 'Restaurant_Key';
}

interface ListPlacesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPlacesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListPlacesData, undefined>;
  operationName: string;
}
export const listPlacesRef: ListPlacesRef;

export function listPlaces(options?: ExecuteQueryOptions): QueryPromise<ListPlacesData, undefined>;
export function listPlaces(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListPlacesData, undefined>;

