import {
  ActionPanel,
  Color,
  getLocalStorageItem,
  Icon,
  List,
  setLocalStorageItem,
  showToast,
  ToastStyle,
} from '@raycast/api';
import { useEffect, useState } from 'react';
import { AttributeType } from './lib/enums';
import { controlDelay, getNodes, Node, putAttribute } from './lib/homee';
import { waitFor } from './lib/utils';

export default function devices() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isCached, setIsCached] = useState(true);
  const [count, setCount] = useState(0);

  function updateData() {
    setCount((prev) => prev + 1);
  }

  async function loadCache() {
    const cachedNodes: string | undefined = await getLocalStorageItem('nodes');
    if (cachedNodes && !nodes.length) {
      setNodes(JSON.parse(cachedNodes));
    }
  }

  async function fetchNodes() {
    const nodesData = await getNodes().catch(async () => {
      await showToast(ToastStyle.Failure, 'Could not fetch devices.');
    });

    if (nodesData) {
      setNodes(nodesData);
      setIsCached(false);
      await setLocalStorageItem('nodes', JSON.stringify(nodesData));
    }
  }

  useEffect(() => {
    loadCache();
  }, []);

  useEffect(() => {
    fetchNodes();
  }, [count]);

  const tintColor = (node: Node) => {
    if (isCached) return Color.PrimaryText;
    if (onOffAttribute(node)?.target_value === 1) return Color.Yellow;
    return Color.PrimaryText;
  };

  const toggleValue = (node: Node) => {
    if (isCached) return 1;
    if (onOffAttribute(node)?.target_value === 1) return 0;
    return 1;
  };

  return (
    <List isLoading={!nodes.length || isCached}>
      {nodes.map((node) => (
        <List.Item
          key={node.id}
          title={node.name}
          icon={{
            source: Icon.Circle,
            tintColor: tintColor(node),
          }}
          actions={
            <ActionPanel>
              <ActionPanel.Item
                title="Toggle"
                shortcut={{ modifiers: [], key: 'enter' }}
                onAction={async () => {
                  putAttribute(onOffAttribute(node)?.id!, toggleValue(node));
                  await waitFor(controlDelay);
                  updateData();
                }}
              />
              <ActionPanel.Item
                title="Turn On"
                shortcut={{ modifiers: ['cmd'], key: 'enter' }}
                onAction={async () => {
                  putAttribute(onOffAttribute(node)?.id!, 1);
                  await waitFor(controlDelay);
                  updateData();
                }}
              />
              <ActionPanel.Item
                title="Turn Off"
                shortcut={{ modifiers: ['cmd'], key: 'delete' }}
                onAction={async () => {
                  putAttribute(onOffAttribute(node)?.id!, 0);
                  await waitFor(controlDelay);
                  updateData();
                }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

const onOffAttribute = (node: Node) =>
  node.attributes.find((attr) => attr.type === AttributeType.OnOff);
