import { ActionPanel, Color, Icon, List } from '@raycast/api';
import { useEffect, useState } from 'react';
import { AttributeType } from './lib/enums';
import {
  getGroups,
  getNodes,
  Node,
  Group,
  putGroup,
  Relationship,
  getRelationships,
  isGroupOn,
} from './lib/homee';

const delay = 500;

export default function groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const groupsData = await getGroups();
      setGroups(groupsData);
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const relationshipsData = await getRelationships();
      setRelationships(relationshipsData);
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const nodesData = await getNodes();
      setNodes(nodesData);
    }

    fetchData();
  }, [count]);

  return (
    <List isLoading={!groups.length}>
      {groups.map((group) => (
        <List.Item
          key={group.id}
          title={group.name}
          icon={{
            source: Icon.Circle,
            tintColor: isGroupOn(group, relationships, nodes)
              ? Color.Yellow
              : Color.PrimaryText,
          }}
          actions={
            <ActionPanel>
              <ActionPanel.Item
                title="Toggle"
                onAction={() => {
                  putGroup(
                    group.id,
                    AttributeType.OnOff,
                    isGroupOn(group, relationships, nodes) ? 0 : 1
                  );
                  setTimeout(() => setCount(count + 1), delay);
                }}
              />
              <ActionPanel.Item
                title="Turn On"
                onAction={() => {
                  putGroup(group.id, AttributeType.OnOff, 1);
                  setTimeout(() => setCount(count + 1), delay);
                }}
              />
              <ActionPanel.Item
                title="Turn Off"
                onAction={() => {
                  putGroup(group.id, AttributeType.OnOff, 0);
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
