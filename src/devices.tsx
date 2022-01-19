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

export default function devices() {
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
    <List isLoading={isLoading}>
      {(isCached || isSuccess) &&
        nodes.map((node) => (
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
                  onAction={() =>
                    control(onOffAttribute(node)?.id!, toggleValue(node))
                  }
                />
                <ActionPanel.Item
                  title="Turn On"
                  shortcut={{ modifiers: ['cmd'], key: 'enter' }}
                  onAction={() => control(onOffAttribute(node)?.id!, 1)}
                />
                <ActionPanel.Item
                  title="Turn Off"
                  shortcut={{ modifiers: ['cmd'], key: 'delete' }}
                  onAction={() => control(onOffAttribute(node)?.id!, 0)}
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
