import {
  ActionPanel,
  Color,
  getLocalStorageItem,
  Icon,
  List,
  setLocalStorageItem,
} from '@raycast/api';
import { useEffect, useState } from 'react';
import { AttributeType } from './lib/enums';
import { getNodes, Node, putAttribute } from './lib/homee';

const delay = 200;

export default function devices() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isCached, setIsCached] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      const cachedNodes: string | undefined = await getLocalStorageItem(
        'nodes'
      );
      if (cachedNodes && !nodes.length) {
        setNodes(JSON.parse(cachedNodes));
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const nodesData = await getNodes();
      setNodes(nodesData);
      setIsCached(false);
      await setLocalStorageItem('nodes', JSON.stringify(nodesData));
    }

    fetchData();
  }, [count]);

  return (
    <List isLoading={!nodes.length || isCached}>
      {nodes.map((node) => (
        <List.Item
          key={node.id}
          title={node.name}
          icon={{
            source: Icon.Circle,
            tintColor: isCached
              ? Color.PrimaryText
              : onOff(node)?.target_value === 1
              ? Color.Yellow
              : Color.PrimaryText,
          }}
          actions={
            <ActionPanel>
              <ActionPanel.Item
                title="Toggle"
                shortcut={{ modifiers: [], key: 'enter' }}
                onAction={() => {
                  putAttribute(
                    onOff(node)?.id || 0,
                    isCached ? 1 : onOff(node)?.target_value === 1 ? 0 : 1
                  );
                  setTimeout(() => setCount(count + 1), delay);
                }}
              />
              <ActionPanel.Item
                title="Turn On"
                shortcut={{ modifiers: ['cmd'], key: 'enter' }}
                onAction={() => {
                  putAttribute(onOff(node)?.id || 0, 1);
                  setTimeout(() => setCount(count + 1), delay);
                }}
              />
              <ActionPanel.Item
                title="Turn Off"
                shortcut={{ modifiers: ['cmd'], key: 'delete' }}
                onAction={() => {
                  putAttribute(onOff(node)?.id || 0, 0);
                  setTimeout(() => setCount(count + 1), delay);
                }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

const onOff = (node: Node) =>
  node.attributes.find((attr) => attr.type === AttributeType.OnOff);
