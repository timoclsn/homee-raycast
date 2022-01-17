import { ActionPanel, Color, Icon, List } from '@raycast/api';
import { useEffect, useState } from 'react';
import { AttributeType } from './lib/enums';
import { getNodes, Node, putAttribute } from './lib/homee';

const delay = 200;

export default function devices() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const nodesData = await getNodes();
      setNodes(nodesData);
    }

    fetchData();
  }, [count]);

  return (
    <List isLoading={!nodes.length}>
      {nodes.map((node) => (
        <List.Item
          key={node.id}
          title={node.name}
          icon={{
            source: Icon.Circle,
            tintColor:
              onOff(node)?.target_value === 1
                ? Color.Yellow
                : Color.PrimaryText,
          }}
          actions={
            <ActionPanel>
              <ActionPanel.Item
                title="Toggle"
                onAction={() => {
                  putAttribute(
                    onOff(node)?.id || 0,
                    onOff(node)?.target_value === 1 ? 0 : 1
                  );
                  setTimeout(() => setCount(count + 1), delay);
                }}
              />
              <ActionPanel.Item
                title="Turn On"
                onAction={() => {
                  putAttribute(onOff(node)?.id || 0, 1);
                  setTimeout(() => setCount(count + 1), delay);
                }}
              />
              <ActionPanel.Item
                title="Turn Off"
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
