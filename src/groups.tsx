import {
  ActionPanel,
  Color,
  Icon,
  List,
  showToast,
  ToastStyle,
} from '@raycast/api';
import { AttributeType } from './lib/enums';
import { Node, Group, Relationship, controlDelay } from './lib/homee';
import { waitFor } from './lib/utils';
import { useGroups } from './hooks/useGroups';
import { useNodes } from './hooks/useNodes';
import { useRelationships } from './hooks/useRelationships';
import { useState } from 'react';

export default function groups() {
  const [lastControlled, setLastControlled] = useState<number>();
  const {
    isLoading: groupsIsLoading,
    isCached: groupsIsCached,
    isSuccess: groupsIsSuccess,
    isError: groupsIsError,
    data: groups,
    control: groupsControl,
  } = useGroups();

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
      (value) => value === true
    );

  const isLoading = () =>
    [groupsIsLoading, nodesIsLoading, relationshipsIsLoading].some(
      (value) => value === true
    );

  const isError = () =>
    [groupsIsError, nodesIsError, relationshipsIsError].some(
      (value) => value === true
    );

  const isSuccess = () =>
    [groupsIsSuccess, nodesIsSuccess, relationshipsIsSuccess].every(
      (value) => value === true
    );

  if (isError()) {
    showToast(ToastStyle.Failure, 'Could not fetch groups.');
  }

  const subtitle = (group: Group) => {
    if (isCached()) return '-';
    if (isLoading() && lastControlled === group.id) return 'Refreshing…';
    if (groupIsOn(group, relationships, nodes)) return 'On';
    return 'Off';
  };

  const tintColor = (group: Group) => {
    if (isCached()) return Color.PrimaryText;
    if (groupIsOn(group, relationships, nodes)) return Color.Yellow;
    return Color.PrimaryText;
  };

  const toggleValue = (group: Group) => {
    if (isCached()) return 1;
    if (groupIsOn(group, relationships, nodes)) return 0;
    return 1;
  };

  return (
    <List isLoading={isLoading()}>
      {(isCached() || isSuccess()) &&
        groups.map((group) => (
          <List.Item
            key={group.id}
            title={group.name}
            subtitle={subtitle(group)}
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
                    groupsControl(
                      group.id,
                      AttributeType.OnOff,
                      toggleValue(group)
                    );
                    setLastControlled(group.id);
                    await waitFor(controlDelay);
                    nodesRefetch();
                  }}
                />
                <ActionPanel.Item
                  title="Turn On"
                  shortcut={{ modifiers: ['cmd'], key: 'enter' }}
                  onAction={async () => {
                    groupsControl(group.id, AttributeType.OnOff, 1);
                    setLastControlled(group.id);
                    await waitFor(controlDelay);
                    nodesRefetch();
                  }}
                />
                <ActionPanel.Item
                  title="Turn Off"
                  shortcut={{ modifiers: ['cmd'], key: 'delete' }}
                  onAction={async () => {
                    groupsControl(group.id, AttributeType.OnOff, 0);
                    setLastControlled(group.id);
                    await waitFor(controlDelay);
                    nodesRefetch();
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

function groupIsOn(group: Group, relationships: Relationship[], nodes: Node[]) {
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
