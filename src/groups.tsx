import { ActionPanel, List } from '@raycast/api';
import { useEffect, useState } from 'react';
import { AttributeType } from './lib/enums';
import { getGroups, Group, putGroup } from './lib/homee';

export default function groups() {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    async function fetchData() {
      const groupsData = await getGroups();
      setGroups(groupsData);
    }

    fetchData();
  }, []);

  return (
    <List isLoading={!groups.length}>
      {groups.map((group) => (
        <List.Item
          key={group.id}
          title={group.name}
          actions={
            <ActionPanel>
              <ActionPanel.Item
                title="Turn On"
                onAction={() => putGroup(group.id, AttributeType.OnOff, 1)}
              />
              <ActionPanel.Item
                title="Turn Off"
                onAction={() => putGroup(group.id, AttributeType.OnOff, 0)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
