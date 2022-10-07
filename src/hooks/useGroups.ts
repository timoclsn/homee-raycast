import { LocalStorage } from '@raycast/api';
import { useEffect, useReducer } from 'react';
import { AttributeType } from '../lib/enums';
import { controlDelay, getGroups, Group, putGroup } from '../lib/homee';
import { waitFor } from '../lib/utils';
import { useNodes } from './useNodes';
import { useRelationships } from './useRelationships';

interface State {
  groupsIsLoading: boolean;
  groupsIsCached: boolean;
  groupsIsSuccess: boolean;
  groupsIsError: boolean;
  data: Array<Group>;
  lastControlled: number;
}

const initalState: State = {
  groupsIsLoading: true,
  groupsIsCached: false,
  groupsIsSuccess: false,
  groupsIsError: false,
  data: [],
  lastControlled: 0,
};

type ActionType =
  | { type: 'loadedCache'; payload: Array<Group> }
  | { type: 'fetchGroups' }
  | { type: 'fetchGroupsSuccess'; payload: Array<Group> }
  | { type: 'fetchGroupsError' }
  | { type: 'control'; payload: number };

const reducer = (state: State, action: ActionType): State => {
  switch (action.type) {
    case 'loadedCache':
      return {
        ...state,
        data: action.payload,
        groupsIsCached: true,
      };
    case 'fetchGroups':
      return {
        ...state,
        groupsIsLoading: true,
        groupsIsError: false,
      };
    case 'fetchGroupsSuccess':
      return {
        ...state,
        data: action.payload,
        groupsIsLoading: false,
        groupsIsSuccess: true,
        groupsIsCached: false,
      };
    case 'fetchGroupsError':
      return {
        ...state,
        groupsIsLoading: false,
        groupsIsError: true,
      };
    case 'control':
      return {
        ...state,
        lastControlled: action.payload,
      };
    default:
      throw new Error('Unknown action type');
  }
};

export function useGroups() {
  const [state, dispatch] = useReducer(reducer, initalState);
  const {
    groupsIsLoading,
    groupsIsCached,
    groupsIsSuccess,
    groupsIsError,
    data,
    lastControlled,
  } = state;

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
      dispatch({
        type: 'loadedCache',
        payload: JSON.parse(cachedGroups.toString()),
      });
    }
  }

  async function fetchGroups() {
    dispatch({
      type: 'fetchGroups',
    });

    const groupsData = await getGroups().catch(() => {
      dispatch({ type: 'fetchGroupsError' });
    });

    if (groupsData) {
      dispatch({
        type: 'fetchGroupsSuccess',
        payload: groupsData,
      });
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
    dispatch({
      type: 'control',
      payload: groupId,
    });
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
