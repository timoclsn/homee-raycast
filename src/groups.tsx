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
import {
  getGroups,
  getNodes,
  Node,
  Group,
  putGroup,
  Relationship,
  getRelationships,
} from './lib/homee';

const delay = 200;

export default function groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [isCached, setIsCached] = useState({
    groups: true,
    nodes: true,
    relationships: true,
  });
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      const cachedGroups: string | undefined = await getLocalStorageItem(
        'groups'
      );
      if (cachedGroups && !groups.length) {
        setGroups(JSON.parse(cachedGroups));
      }

      const cachedNodes: string | undefined = await getLocalStorageItem(
        'nodes'
      );
      if (cachedNodes && !nodes.length) {
        setNodes(JSON.parse(cachedNodes));
      }

      const cachedRelationships: string | undefined = await getLocalStorageItem(
        'relationships'
      );
      if (cachedRelationships && !relationships.length) {
        setRelationships(JSON.parse(cachedRelationships));
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const groupsData = await getGroups();
      setGroups(groupsData);
      setIsCached((prev) => ({
        ...prev,
        groups: false,
      }));
      await setLocalStorageItem('groups', JSON.stringify(groupsData));
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const nodesData = await getNodes();
      setNodes(nodesData);
      setIsCached((prev) => ({
        ...prev,
        nodes: false,
      }));
      await setLocalStorageItem('nodes', JSON.stringify(nodesData));
    }

    fetchData();
  }, [count]);

  useEffect(() => {
    async function fetchData() {
      const relationshipsData = await getRelationships();
      setRelationships(relationshipsData);
      setIsCached((prev) => ({
        ...prev,
        relationships: false,
      }));
      await setLocalStorageItem(
        'relationships',
        JSON.stringify(relationshipsData)
      );
    }

    fetchData();
  }, []);

  const isSomeCached = () =>
    Object.values(isCached).some((value) => value === true);

  return (
    <List isLoading={!groups.length || isSomeCached()}>
      {groups.map((group) => (
        <List.Item
          key={group.id}
          title={group.name}
          icon={{
            source: Icon.Circle,
            tintColor: isSomeCached()
              ? Color.PrimaryText
              : isGroupOn(group, relationships, nodes)
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
                    isSomeCached()
                      ? 1
                      : isGroupOn(group, relationships, nodes)
                      ? 0
                      : 1
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

function getGroupNodes(
  group: Group,
  relationships: Relationship[],
  nodes: Node[]
) {
  return relationships.flatMap((relationship) => {
    if (relationship.group_id === group.id) {
      return nodes.find((node) => node.id === relationship.node_id) || [];
    }
    return [];
  });
}

export function isGroupOn(
  group: Group,
  relationships: Relationship[],
  nodes: Node[]
) {
  const groupNodes = getGroupNodes(group, relationships, nodes);
  const onOffNodes = groupNodes.filter((node) =>
    node.attributes.find((attribute) => attribute.type === AttributeType.OnOff)
  );

  if (onOffNodes.length === 0) {
    return false;
  }

  return onOffNodes.every(
    (node) =>
      node.attributes.find(
        (attribute) => attribute.type === AttributeType.OnOff
      )?.target_value === 1
  );
}
