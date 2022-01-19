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
import {
  getGroups,
  getNodes,
  Node,
  Group,
  putGroup,
  Relationship,
  getRelationships,
  controlDelay,
} from './lib/homee';
import { waitFor } from './lib/utils';

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

  function updateData() {
    setCount((prev) => prev + 1);
  }

  async function loadCache() {
    const cachedGroups: string | undefined = await getLocalStorageItem(
      'groups'
    );
    if (cachedGroups && !groups.length) {
      setGroups(JSON.parse(cachedGroups));
    }

    const cachedNodes: string | undefined = await getLocalStorageItem('nodes');
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

  async function fetchGroups() {
    const groupsData = await getGroups().catch(async () => {
      await showToast(ToastStyle.Failure, 'Could not fetch groups.');
    });

    if (groupsData) {
      setGroups(groupsData);
      setIsCached((prev) => ({
        ...prev,
        groups: false,
      }));
      await setLocalStorageItem('groups', JSON.stringify(groupsData));
    }
  }

  async function fetchNodes() {
    const nodesData = await getNodes().catch(async () => {
      await showToast(ToastStyle.Failure, 'Could not fetch devices.');
    });

    if (nodesData) {
      setNodes(nodesData);
      setIsCached((prev) => ({
        ...prev,
        nodes: false,
      }));
      await setLocalStorageItem('nodes', JSON.stringify(nodesData));
    }
  }

  async function fetchRelationships() {
    const relationshipsData = await getRelationships().catch(async () => {
      await showToast(ToastStyle.Failure, 'Could not fetch relationships.');
    });

    if (relationshipsData) {
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
  }

  useEffect(() => {
    loadCache();
    fetchGroups();
    fetchRelationships();
  }, []);

  useEffect(() => {
    fetchNodes();
  }, [count]);

  const isSomeCached = () =>
    Object.values(isCached).some((value) => value === true);

  const tintColor = (group: Group) => {
    if (isSomeCached()) return Color.PrimaryText;
    if (isGroupOn(group, relationships, nodes)) return Color.Yellow;
    return Color.PrimaryText;
  };

  const toggleValue = (group: Group) => {
    if (isSomeCached()) return 1;
    if (isGroupOn(group, relationships, nodes)) return 0;
    return 1;
  };

  return (
    <List isLoading={!groups.length || isSomeCached()}>
      {groups.map((group) => (
        <List.Item
          key={group.id}
          title={group.name}
          icon={{
            source: Icon.Circle,
            tintColor: tintColor(group),
          }}
          actions={
            <ActionPanel>
              <ActionPanel.Item
                title="Toggle"
                shortcut={{ modifiers: [], key: 'enter' }}
                onAction={async () => {
                  putGroup(group.id, AttributeType.OnOff, toggleValue(group));
                  await waitFor(controlDelay);
                  updateData();
                }}
              />
              <ActionPanel.Item
                title="Turn On"
                shortcut={{ modifiers: ['cmd'], key: 'enter' }}
                onAction={async () => {
                  putGroup(group.id, AttributeType.OnOff, 1);
                  await waitFor(controlDelay);
                  updateData();
                }}
              />
              <ActionPanel.Item
                title="Turn Off"
                shortcut={{ modifiers: ['cmd'], key: 'delete' }}
                onAction={async () => {
                  putGroup(group.id, AttributeType.OnOff, 0);
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

function getGroupNodes(
  group: Group,
  relationships: Relationship[],
  nodes: Node[]
) {
  return relationships.flatMap((relationship) =>
    relationship.group_id === group.id
      ? nodes.find((node) => node.id === relationship.node_id) || []
      : []
  );
}

function isGroupOn(group: Group, relationships: Relationship[], nodes: Node[]) {
  const groupNodes = getGroupNodes(group, relationships, nodes);

  const onOffNodes = groupNodes.filter((node) =>
    node.attributes.find((attribute) => attribute.type === AttributeType.OnOff)
  );

  if (onOffNodes.length === 0) return false;

  return onOffNodes.every(
    (node) =>
      node.attributes.find(
        (attribute) => attribute.type === AttributeType.OnOff
      )?.target_value === 1
  );
}
