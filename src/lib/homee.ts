import WebSocket from 'ws';
import { AttributeType, GroupCategory } from './enums';
import { preferences } from '@raycast/api';
import fetch from 'node-fetch';

const homeeID = preferences.homeeId?.value as string;
const accessToken = preferences.accessToken?.value as string;

export interface Group {
  id: number;
  name: string;
  phonetic_name: string;
  services: string;
  category: GroupCategory;
  image: string;
}

export function getGroups() {
  return new Promise<Group[]>((resolve, reject) => {
    let groups: Group[] = [];
    const ws = new WebSocket(
      `wss://${homeeID}.hom.ee/connection?access_token=${accessToken}`,
      'v2'
    );

    ws.on('error', () => {
      reject(groups);
    });

    ws.on('open', () => {
      ws.send('GET:groups');
    });

    ws.on('message', (data: string) => {
      const dataObj: { groups: Group[] } = JSON.parse(data);

      if (dataObj.groups) {
        groups = dataObj.groups;
        groups = groups
          .filter((group) => group.category === GroupCategory.None)
          .map((group) => {
            return { ...group, name: decodeURIComponent(group.name) };
          });
        ws.close();
      }
    });

    ws.on('close', () => {
      resolve(groups);
    });
  });
}

export async function putGroup(
  groupID: number,
  attributeType: AttributeType,
  targetValue: number
) {
  return await fetch(
    `https://${homeeID}.hom.ee/api/v2/groups/${groupID}?attribute_type=${attributeType}&value=${targetValue}`,
    {
      method: 'PUT',
      headers: {
        Cookie: accessToken ?? '',
      },
    }
  );
}
