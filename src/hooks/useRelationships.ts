import { LocalStorage } from '@raycast/api';
import { useEffect, useReducer } from 'react';
import { getRelationships, Relationship } from '../lib/homee';

interface State {
  isLoading: boolean;
  isCached: boolean;
  isSuccess: boolean;
  isError: boolean;
  data: Array<Relationship>;
}

const initalState: State = {
  isLoading: true,
  isCached: false,
  isSuccess: false,
  isError: false,
  data: [],
};

type ActionType =
  | { type: 'loadedCache'; payload: Array<Relationship> }
  | { type: 'fetchRelationships' }
  | { type: 'fetchRelationshipsSuccess'; payload: Array<Relationship> }
  | { type: 'fetchRelationshipsError' };

const reducer = (state: State, action: ActionType): State => {
  switch (action.type) {
    case 'loadedCache':
      return {
        ...state,
        data: action.payload,
        isCached: true,
      };
    case 'fetchRelationships':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'fetchRelationshipsSuccess':
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        isSuccess: true,
        isCached: false,
      };
    case 'fetchRelationshipsError':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error('Unknown action type');
  }
};

export function useRelationships() {
  const [state, dispatch] = useReducer(reducer, initalState);
  const { isLoading, isCached, isSuccess, isError, data } = state;

  async function loadCache() {
    const cachedRelationships = await LocalStorage.getItem('relationships');
    if (cachedRelationships && !data.length) {
      dispatch({
        type: 'loadedCache',
        payload: JSON.parse(cachedRelationships.toString()),
      });
    }
  }

  async function fetchRelationships() {
    dispatch({
      type: 'fetchRelationships',
    });

    const relationshipsData = await getRelationships().catch(() => {
      dispatch({ type: 'fetchRelationshipsError' });
    });

    if (relationshipsData) {
      dispatch({
        type: 'fetchRelationshipsSuccess',
        payload: relationshipsData,
      });
      await LocalStorage.setItem(
        'relationships',
        JSON.stringify(relationshipsData)
      );
    }
  }

  useEffect(() => {
    loadCache();
    fetchRelationships();
  }, []);

  return {
    isLoading,
    isCached,
    isSuccess,
    isError,
    data,
  } as const;
}
