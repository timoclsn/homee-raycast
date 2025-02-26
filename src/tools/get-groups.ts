import { getGroups } from '../lib/homee';

export default async function () {
  const groups = await getGroups();

  if (!groups) {
    return 'No groups found.';
  }

  return groups;
}
