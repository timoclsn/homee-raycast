import { ActionPanel, List } from '@raycast/api';
import { useEffect, useState } from 'react';
import { getHomeegrams, Homeegram, playHomeegram } from './lib/homee';

export default function homeegrams() {
  const [homeegrams, setHomeegrams] = useState<Homeegram[]>([]);

  useEffect(() => {
    async function fetchData() {
      const homeegramsData = await getHomeegrams();
      setHomeegrams(homeegramsData);
    }

    fetchData();
  }, []);

  return (
    <List isLoading={!homeegrams.length}>
      {homeegrams.map((homeegram) => (
        <List.Item
          key={homeegram.id}
          title={homeegram.name}
          actions={
            <ActionPanel>
              <ActionPanel.Item
                title="Play"
                onAction={() => playHomeegram(homeegram.id)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
