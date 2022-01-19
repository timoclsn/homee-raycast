import { getLocalStorageItem, setLocalStorageItem } from '@raycast/api';
import { useState, useEffect } from 'react';
import { AttributeType } from '../lib/enums';
import { Group, getGroups, putGroup } from '../lib/homee';

export function useGroups() {
  const [isLoading, setIsLoading] = useState(true);
  const [isCached, setIsCached] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState<Group[]>([]);

  async function loadCache() {
    const cachedGroups: string | undefined = await getLocalStorageItem(
      'groups'
    );
    if (cachedGroups && !data.length) {
      setData(JSON.parse(cachedGroups));
      setIsCached(true);
    }
  }

  async function fetchGroups() {
    setIsLoading(true);
    setIsError(false);

    const groupsData = await getGroups().catch(() => {
      setIsError(true);
      setIsLoading(false);
    });

    if (groupsData) {
      setData(groupsData);
      setIsLoading(false);
      setIsSuccess(true);
      setIsCached(false);
      await setLocalStorageItem('groups', JSON.stringify(groupsData));
    }
  }

  useEffect(() => {
    loadCache();
    fetchGroups();
  }, []);

  function control(
    groupId: number,
    attributeType: AttributeType,
    value: number
  ) {
    putGroup(groupId, attributeType, value);
  }

  return {
    isLoading,
    isCached,
    isSuccess,
    isError,
    data,
    control,
  } as const;
}
