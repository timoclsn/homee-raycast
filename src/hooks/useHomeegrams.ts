import { LocalStorage } from '@raycast/api';
import { useEffect, useReducer } from 'react';
import { getHomeegrams, Homeegram, playHomeegram } from '../lib/homee';

interface State {
  isLoading: boolean;
  isCached: boolean;
  isSuccess: boolean;
  isError: boolean;
  data: Array<Homeegram>;
}

const initalState: State = {
  isLoading: true,
  isCached: false,
  isSuccess: false,
  isError: false,
  data: [],
};

type ActionType =
  | { type: 'loadedCache'; payload: Array<Homeegram> }
  | { type: 'fetchHomeegrams' }
  | { type: 'fetchHomeegramsSuccess'; payload: Array<Homeegram> }
  | { type: 'fetchHomeegramsError' };

const reducer = (state: State, action: ActionType): State => {
  switch (action.type) {
    case 'loadedCache':
      return {
        ...state,
        data: action.payload,
        isCached: true,
      };
    case 'fetchHomeegrams':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'fetchHomeegramsSuccess':
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        isSuccess: true,
        isCached: false,
      };
    case 'fetchHomeegramsError':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error('Unknown action type');
  }
};

export function useHomeegrams() {
  const [state, dispatch] = useReducer(reducer, initalState);
  const { isLoading, isCached, isSuccess, isError, data } = state;

  async function loadCache() {
    const cachedHomeegrams = await LocalStorage.getItem('homeegrams');
    if (cachedHomeegrams && !data.length) {
      dispatch({
        type: 'loadedCache',
        payload: JSON.parse(cachedHomeegrams.toString()),
      });
    }
  }

  async function fetchHomeegrams() {
    dispatch({
      type: 'fetchHomeegrams',
    });

    const homeegramsData = await getHomeegrams().catch(() => {
      dispatch({ type: 'fetchHomeegramsError' });
    });

    if (homeegramsData) {
      dispatch({
        type: 'fetchHomeegramsSuccess',
        payload: homeegramsData,
      });
      await LocalStorage.setItem('homeegrams', JSON.stringify(homeegramsData));
    }
  }
  useEffect(() => {
    loadCache();
    fetchHomeegrams();
  }, []);

  function play(homeegramID: number) {
    playHomeegram(homeegramID);
  }

  return {
    isLoading,
    isCached,
    isSuccess,
    isError,
    data,
    play,
  } as const;
}
