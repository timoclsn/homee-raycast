import {
  ActionPanel,
  Color,
  Icon,
  List,
  Action,
  showToast,
  Toast,
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
    showToast(Toast.Style.Failure, 'Could not fetch groups.');
  }

  const subtitle = (group: Group) => {
    if (isCached) return '-';
    if (isLoading && lastControlled === group.id) return 'Refreshingâ€¦';
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
                <Action
                  title="Toggle"
                  shortcut={{ modifiers: [], key: 'enter' }}
                  onAction={() =>
                    control(group.id, AttributeType.OnOff, toggleValue(group))
                  }
                />
                <Action
                  title="Turn On"
                  shortcut={{ modifiers: ['cmd'], key: 'enter' }}
                  onAction={() => control(group.id, AttributeType.OnOff, 1)}
                />
                <Action
                  title="Turn Off"
                  shortcut={{ modifiers: ['cmd'], key: 'delete' }}
                  onAction={() => control(group.id, AttributeType.OnOff, 0)}
                />
                <Action.Open
                  title="Open homee"
                  target=""
                  application="homee"
                  shortcut={{ modifiers: ['cmd'], key: 'o' }}
                  icon=""
                />
              </ActionPanel>
            }
          />
        ))}
    </List>
  );
}
