import { LocalStorage } from '@raycast/api';
import { useState, useEffect } from 'react';
import { AttributeType } from '../lib/enums';
import { Group, getGroups, putGroup, controlDelay } from '../lib/homee';
import { waitFor } from '../lib/utils';
import { useNodes } from './useNodes';
import { useRelationships } from './useRelationships';

export function useGroups() {
  const [groupsIsLoading, setGrpupsIsLoading] = useState(true);
  const [groupsIsCached, setGroupsIsCached] = useState(false);
  const [groupsIsSuccess, setGroupsIsSuccess] = useState(false);
  const [groupsIsError, setGroupsIsError] = useState(false);
  const [data, setData] = useState<Group[]>([]);
  const [lastControlled, setLastControlled] = useState<number>();

  const {
    isLoading: nodesIsLoading,
    isCached: nodesIsCached,
    isSuccess: nodesIsSuccess,
    isError: nodesIsError,
    data: nodes,
    refetch: nodesRefetch,
  } = useNodes();

  const {
    isLoading: relationshipsIsLoading,
    isCached: relationshipsIsCached,
    isSuccess: relationshipsIsSuccess,
    isError: relationshipsIsError,
    data: relationships,
  } = useRelationships();

  const isCached = () =>
    [groupsIsCached, nodesIsCached, relationshipsIsCached].some(
      (value) => value
    );

  const isLoading = () =>
    [groupsIsLoading, nodesIsLoading, relationshipsIsLoading].some(
      (value) => value
    );

  const isError = () =>
    [groupsIsError, nodesIsError, relationshipsIsError].some((value) => value);

  const isSuccess = () =>
    [groupsIsSuccess, nodesIsSuccess, relationshipsIsSuccess].every(
      (value) => value
    );

  async function loadCache() {
    const cachedGroups = await LocalStorage.getItem('groups');
    if (cachedGroups && !data.length) {
      setData(JSON.parse(cachedGroups.toString()));
      setGroupsIsCached(true);
    }
  }

  async function fetchGroups() {
    setGrpupsIsLoading(true);
    setGroupsIsError(false);

    const groupsData = await getGroups().catch(() => {
      setGroupsIsError(true);
      setGrpupsIsLoading(false);
    });

    if (groupsData) {
      setData(groupsData);
      setGrpupsIsLoading(false);
      setGroupsIsSuccess(true);
      setGroupsIsCached(false);
      await LocalStorage.setItem('groups', JSON.stringify(groupsData));
    }
  }

  useEffect(() => {
    loadCache();
    fetchGroups();
  }, []);

  async function control(
    groupId: number,
    attributeType: AttributeType,
    value: number
  ) {
    putGroup(groupId, attributeType, value);
    setLastControlled(groupId);
    await waitFor(controlDelay);
    nodesRefetch();
  }

  function getGroupNodes(group: Group) {
    return relationships.flatMap((relationship) =>
      relationship.group_id === group.id
        ? nodes.find((node) => node.id === relationship.node_id) || []
        : []
    );
  }

  function groupIsOn(group: Group) {
    const groupNodes = getGroupNodes(group);

    const onOffNodes = groupNodes.filter((node) =>
      node.attributes.find(
        (attribute) => attribute.type === AttributeType.OnOff
      )
    );

    if (onOffNodes.length === 0) return false;

    return onOffNodes.every(
      (node) =>
        node.attributes.find(
          (attribute) => attribute.type === AttributeType.OnOff
        )?.target_value === 1
    );
  }

  return {
    isLoading: isLoading(),
    isCached: isCached(),
    isSuccess: isSuccess(),
    isError: isError(),
    data,
    lastControlled,
    control,
    groupIsOn,
  } as const;
}
