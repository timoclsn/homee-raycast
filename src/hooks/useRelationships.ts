import { LocalStorage } from '@raycast/api';
import { useEffect, useState } from 'react';
import { getRelationships, Relationship } from '../lib/homee';

export function useRelationships() {
  const [isLoading, setIsLoading] = useState(true);
  const [isCached, setIsCached] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState<Relationship[]>([]);

  async function loadCache() {
    const cachedRelationships = await LocalStorage.getItem('relationships');
    if (cachedRelationships && !data.length) {
      setData(JSON.parse(cachedRelationships.toString()));
      setIsCached(true);
    }
  }

  async function fetchRelationships() {
    setIsLoading(true);
    setIsError(false);

    const relationshipsData = await getRelationships().catch(() => {
      setIsError(true);
      setIsLoading(false);
    });

    if (relationshipsData) {
      setData(relationshipsData);
      setIsLoading(false);
      setIsSuccess(true);
      setIsCached(false);
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
