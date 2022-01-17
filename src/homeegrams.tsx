import {
  ActionPanel,
  getLocalStorageItem,
  Icon,
  List,
  setLocalStorageItem,
} from '@raycast/api';
import { useEffect, useState } from 'react';
import { getHomeegrams, Homeegram, playHomeegram } from './lib/homee';

export default function homeegrams() {
  const [homeegrams, setHomeegrams] = useState<Homeegram[]>([]);
  const [isCached, setIsCached] = useState(true);

  useEffect(() => {
    async function loadData() {
      const cachedHomeegrams: string | undefined = await getLocalStorageItem(
        'homeegrams'
      );
      if (cachedHomeegrams && !homeegrams.length) {
        setHomeegrams(JSON.parse(cachedHomeegrams));
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const homeegramsData = await getHomeegrams();
      setHomeegrams(homeegramsData);
      setIsCached(false);
      await setLocalStorageItem('homeegrams', JSON.stringify(homeegramsData));
    }

    fetchData();
  }, []);

  return (
    <List isLoading={!homeegrams.length || isCached}>
      {homeegrams.map((homeegram) => (
        <List.Item
          key={homeegram.id}
          title={homeegram.name}
          icon={Icon.ArrowRight}
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
