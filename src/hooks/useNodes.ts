import { LocalStorage } from '@raycast/api';
import { useEffect, useState } from 'react';
import { AttributeType } from '../lib/enums';
import { controlDelay, getNodes, putAttribute } from '../lib/homee';
import { Node } from '../lib/homee';
import { waitFor } from '../lib/utils';

export function useNodes() {
  const [isLoading, setIsLoading] = useState(true);
  const [isCached, setIsCached] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState<Node[]>([]);
  const [count, setCount] = useState(0);
  const [lastControlled, setLastControlled] = useState<number>();

  function refetch() {
    setCount((prev) => prev + 1);
  }

  async function loadCache() {
    const cachedNodes = await LocalStorage.getItem('nodes');
    if (cachedNodes && !data.length) {
      setData(JSON.parse(cachedNodes.toString()));
      setIsCached(true);
    }
  }

  async function fetchNodes() {
    setIsLoading(true);
    setIsError(false);

    const nodesData = await getNodes().catch(() => {
      setIsError(true);
      setIsLoading(false);
    });

    if (nodesData) {
      setData(nodesData);
      setIsLoading(false);
      setIsSuccess(true);
      setIsCached(false);
      await LocalStorage.setItem('nodes', JSON.stringify(nodesData));
    }
  }

  useEffect(() => {
    loadCache();
  }, []);

  useEffect(() => {
    fetchNodes();
  }, [count]);

  async function control(nodeID: number, attributeID: number, value: number) {
    putAttribute(attributeID, value);
    setLastControlled(nodeID);
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
