import { getLocalStorageItem, setLocalStorageItem } from '@raycast/api';
import { useEffect, useState } from 'react';
import { getHomeegrams, Homeegram, playHomeegram } from '../lib/homee';

export function useHomeegrams() {
  const [isLoading, setIsLoading] = useState(true);
  const [isCached, setIsCached] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState<Homeegram[]>([]);

  async function loadCache() {
    const cachedHomeegrams = await getLocalStorageItem('homeegrams');
    if (cachedHomeegrams && !data.length) {
      setData(JSON.parse(cachedHomeegrams.toString()));
      setIsCached(true);
    }
  }

  async function fetchHomeegrams() {
    setIsLoading(true);
    setIsError(false);

    const homeegramsData = await getHomeegrams().catch(() => {
      setIsError(true);
      setIsLoading(false);
    });

    if (homeegramsData) {
      setData(homeegramsData);
      setIsLoading(false);
      setIsSuccess(true);
      setIsCached(false);
      await setLocalStorageItem('homeegrams', JSON.stringify(homeegramsData));
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
