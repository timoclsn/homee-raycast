import {
  ActionPanel,
  getLocalStorageItem,
  Icon,
  List,
  setLocalStorageItem,
  showToast,
  ToastStyle,
} from '@raycast/api';
import { useEffect, useState } from 'react';
import { getHomeegrams, Homeegram, playHomeegram } from './lib/homee';

export default function homeegrams() {
  const [homeegrams, setHomeegrams] = useState<Homeegram[]>([]);
  const [isCached, setIsCached] = useState(true);

  async function loadCache() {
    const cachedHomeegrams: string | undefined = await getLocalStorageItem(
      'homeegrams'
    );
    if (cachedHomeegrams && !homeegrams.length) {
      setHomeegrams(JSON.parse(cachedHomeegrams));
    }
  }

  async function fetchHomeegrams() {
    const homeegramsData = await getHomeegrams().catch(async () => {
      await showToast(ToastStyle.Failure, 'Could not fetch homeegrams.');
    });

    if (homeegramsData) {
      setHomeegrams(homeegramsData);
      setIsCached(false);
      await setLocalStorageItem('homeegrams', JSON.stringify(homeegramsData));
    }
  }
  useEffect(() => {
    loadCache();
    fetchHomeegrams();
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
                shortcut={{ modifiers: [], key: 'enter' }}
                onAction={() => playHomeegram(homeegram.id)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
