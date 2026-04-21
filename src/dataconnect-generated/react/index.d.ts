import { ListPlacesData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useListPlaces(options?: useDataConnectQueryOptions<ListPlacesData>): UseDataConnectQueryResult<ListPlacesData, undefined>;
export function useListPlaces(dc: DataConnect, options?: useDataConnectQueryOptions<ListPlacesData>): UseDataConnectQueryResult<ListPlacesData, undefined>;
