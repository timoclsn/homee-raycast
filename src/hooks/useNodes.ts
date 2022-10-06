import { LocalStorage } from '@raycast/api';
import { useEffect, useReducer } from 'react';
import { AttributeType } from '../lib/enums';
import { controlDelay, getNodes, Node, putAttribute } from '../lib/homee';
import { waitFor } from '../lib/utils';

interface State {
  isLoading: boolean;
  isCached: boolean;
  isSuccess: boolean;
  isError: boolean;
  data: Array<Node>;
  lastControlled: number;
}

const initalState: State = {
  isLoading: true,
  isCached: false,
  isSuccess: false,
  isError: false,
  data: [],
  lastControlled: 0,
};

type ActionType =
  | { type: 'loadedCache'; payload: Array<Node> }
  | { type: 'fetchNodes' }
  | { type: 'fetchNodesSuccess'; payload: Array<Node> }
  | { type: 'fetchNodesError' }
  | { type: 'control'; payload: number };

const reducer = (state: State, action: ActionType): State => {
  switch (action.type) {
    case 'loadedCache':
      return {
        ...state,
        data: action.payload,
        isCached: true,
      };
    case 'fetchNodes':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'fetchNodesSuccess':
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        isSuccess: true,
        isCached: false,
      };
    case 'fetchNodesError':
      return {
        ...state,
        isLoading: false,
        isError: true,
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

export function useNodes() {
  const [state, dispatch] = useReducer(reducer, initalState);
  const { isLoading, isCached, isSuccess, isError, data, lastControlled } =
    state;

  useEffect(() => {
    loadCache();
    fetchNodes();
  }, []);

  function refetch() {
    fetchNodes();
  }

  async function loadCache() {
    const cachedNodes = await LocalStorage.getItem('nodes');
    if (cachedNodes && !data.length) {
      dispatch({
        type: 'loadedCache',
        payload: JSON.parse(cachedNodes.toString()),
      });
    }
  }

  async function fetchNodes() {
    dispatch({
      type: 'fetchNodes',
    });

    const nodesData = await getNodes().catch(() => {
      dispatch({ type: 'fetchNodesError' });
    });

    if (nodesData) {
      dispatch({
        type: 'fetchNodesSuccess',
        payload: nodesData,
      });
      await LocalStorage.setItem('nodes', JSON.stringify(nodesData));
    }
  }

  async function control(nodeID: number, attributeID: number, value: number) {
    putAttribute(attributeID, value);
    dispatch({
      type: 'control',
      payload: nodeID,
    });
    await waitFor(controlDelay);
    refetch();
  }

  const onOffAttribute = (node: Node) =>
    node.attributes.find((attr) => attr.type === AttributeType.OnOff);

  const nodeIsOn = (node: Node) => onOffAttribute(node)?.target_value === 1;

  return {
    isLoading,
    isCached,
    isSuccess,
    isError,
    data,
    lastControlled,
    control,
    refetch,
    nodeIsOn,
    onOffAttribute,
  } as const;
}
