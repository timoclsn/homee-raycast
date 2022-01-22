import {
  ActionPanel,
  Color,
  Icon,
  List,
  showToast,
  ToastStyle,
} from '@raycast/api';
import { AttributeType } from './lib/enums';
import { Group } from './lib/homee';
import { useGroups } from './hooks/useGroups';

export default function groups() {
  const {
    isLoading,
    isCached,
    isSuccess,
    isError,
    data: groups,
    lastControlled,
    control,
    groupIsOn,
  } = useGroups();

  if (isError) {
    showToast(ToastStyle.Failure, 'Could not fetch groups.');
  }

  const subtitle = (group: Group) => {
    if (isCached) return '-';
    if (isLoading && lastControlled === group.id) return 'Refreshing…';
    if (groupIsOn(group)) return 'On';
    return 'Off';
  };

  const tintColor = (group: Group) => {
    if (isCached) return Color.PrimaryText;
    if (groupIsOn(group)) return Color.Yellow;
    return Color.PrimaryText;
  };

  const toggleValue = (group: Group) => {
    if (isCached) return 1;
    if (groupIsOn(group)) return 0;
    return 1;
  };

  return (
    <List isLoading={isLoading}>
      {(isCached || isSuccess) &&
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
                  onAction={() =>
                    control(group.id, AttributeType.OnOff, toggleValue(group))
                  }
                />
                <ActionPanel.Item
                  title="Turn On"
                  shortcut={{ modifiers: ['cmd'], key: 'enter' }}
                  onAction={() => control(group.id, AttributeType.OnOff, 1)}
                />
                <ActionPanel.Item
                  title="Turn Off"
                  shortcut={{ modifiers: ['cmd'], key: 'delete' }}
                  onAction={() => control(group.id, AttributeType.OnOff, 0)}
                />
              </ActionPanel>
            }
          />
        ))}
    </List>
  );
}
