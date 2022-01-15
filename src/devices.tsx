import { ActionPanel, List } from '@raycast/api';
import { useEffect, useState } from 'react';
import { AttributeType } from './lib/enums';
import { getNodes, Node, putAttribute } from './lib/homee';

export default function devices() {
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    async function fetchData() {
      const nodesData = await getNodes();
      setNodes(nodesData);
    }

    fetchData();
  }, []);

  return (
    <List isLoading={!nodes.length}>
      {nodes.map((node) => (
        <List.Item
          key={node.id}
          title={node.name}
          actions={
            <ActionPanel>
              <ActionPanel.Item
                title="Turn On"
                onAction={() => putAttribute(onOffId(node), 1)}
              />
              <ActionPanel.Item
                title="Turn Off"
                onAction={() => putAttribute(onOffId(node), 0)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

const onOffId = (node: Node) =>
  node.attributes.find((attr) => attr.type === AttributeType.OnOff)?.id || 0;
