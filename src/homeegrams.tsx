import {
  ActionPanel,
  Icon,
  List,
  Action,
  showToast,
  Toast,
} from '@raycast/api';
import { useHomeegrams } from './hooks/useHomeegrams';

export default function homeegrams() {
  const {
    isLoading,
    isCached,
    isSuccess,
    isError,
    data: homeegrams,
    play,
  } = useHomeegrams();

  if (isError) {
    showToast(Toast.Style.Failure, 'Could not fetch homeegrams.');
  }

  return (
    <List isLoading={isLoading}>
      {(isCached || isSuccess) &&
        homeegrams.map((homeegram) => (
          <List.Item
            key={homeegram.id}
            title={homeegram.name}
            icon={Icon.ArrowRight}
            actions={
              <ActionPanel>
                <Action
                  title="Play"
                  shortcut={{ modifiers: [], key: 'enter' }}
                  onAction={() => play(homeegram.id)}
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
