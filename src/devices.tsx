import {
  ActionPanel,
  Color,
  Icon,
  List,
  showToast,
  ToastStyle,
} from '@raycast/api';
import { AttributeType } from './lib/enums';
import { Node } from './lib/homee';
import { useNodes } from './hooks/useNodes';
import { useState } from 'react';

export default function devices() {
  const [lastControlled, setLastControlled] = useState<number>();
  const {
    data: nodes,
    isLoading,
    isCached,
    isSuccess,
    isError,
    control,
  } = useNodes();

  if (isError) {
    showToast(ToastStyle.Failure, 'Could not fetch devices.');
  }

  const subtitle = (node: Node) => {
    if (isCached) return '–';
    if (isLoading && lastControlled === node.id) return 'Refreshing…';
    if (nodeIsOn(node)) return 'On';
    return 'Off';
  };

  const tintColor = (node: Node) => {
    if (isCached) return Color.PrimaryText;
    if (nodeIsOn(node)) return Color.Yellow;
    return Color.PrimaryText;
  };

  const toggleValue = (node: Node) => {
    if (isCached) return 1;
    if (nodeIsOn(node)) return 0;
    return 1;
  };

  return (
    <List isLoading={isLoading}>
      {(isCached || isSuccess) &&
        nodes.map((node) => (
          <List.Item
            key={node.id}
            title={node.name}
            subtitle={subtitle(node)}
            icon={{
              source: Icon.Circle,
              tintColor: tintColor(node),
            }}
            actions={
              <ActionPanel>
                <ActionPanel.Item
                  title="Toggle"
                  shortcut={{ modifiers: [], key: 'enter' }}
                  onAction={() => {
                    setLastControlled(node.id);
                    control(onOffAttribute(node)?.id!, toggleValue(node));
                  }}
                />
                <ActionPanel.Item
                  title="Turn On"
                  shortcut={{ modifiers: ['cmd'], key: 'enter' }}
                  onAction={() => {
                    setLastControlled(node.id);
                    control(onOffAttribute(node)?.id!, 1);
                  }}
                />
                <ActionPanel.Item
                  title="Turn Off"
                  shortcut={{ modifiers: ['cmd'], key: 'delete' }}
                  onAction={() => {
                    setLastControlled(node.id);
                    control(onOffAttribute(node)?.id!, 0);
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

const nodeIsOn = (node: Node) => onOffAttribute(node)?.target_value === 1;
