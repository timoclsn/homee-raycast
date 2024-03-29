import { getPreferenceValues } from '@raycast/api';
import fetch from 'node-fetch';
import WebSocket from 'ws';
import {
  AttributeBasedOn,
  AttributeChangedBy,
  AttributeState,
  AttributeType,
  CubeType,
  GroupCategory,
  NodeProfile,
  NodeProtocol,
  NodeState,
} from './enums';

interface Preferences {
  homeeId: string;
  accessToken: string;
}

const { homeeId, accessToken } = getPreferenceValues<Preferences>();

export interface Node {
  id: number;
  name: string;
  profile: NodeProfile;
  image: string;
  favorite: number;
  order: number;
  protocol: NodeProtocol;
  routing: number;
  state: NodeState;
  state_changed: number;
  added: number;
  history: number;
  cube_type: CubeType;
  note: string;
  services: number;
  phonetic_name: string;
  owner: number;
  security: number;
  attributes: Attribute[];
}

export interface Attribute {
  id: number;
  node_id: number;
  instance: number;
  minimum: number;
  maximum: number;
  current_value: number;
  target_value: number;
  last_value: number;
  unit: string;
  step_value: number;
  editable: number;
  type: AttributeType;
  state: AttributeState;
  last_changed: number;
  changed_by: AttributeChangedBy;
  changed_by_id: number;
  based_on: AttributeBasedOn;
  data: string;
  name: string;
  options: unknown;
}

export interface Group {
  id: number;
  name: string;
  phonetic_name: string;
  services: string;
  category: GroupCategory;
  image: string;
  order: number;
}

export interface Homeegram {
  id: number;
  name: string;
  phonetic_name: string;
  image: string;
  order: number;
  triggers: { switch_trigger: number; switch_triggers: Trigger[] };
}

interface Trigger {
  id: number;
}

export interface Relationship {
  id: number;
  group_id: number;
  node_id: number;
  homeegram_id: number;
  order: number;
}

export const controlDelay = 200;

export function getNodes() {
  return new Promise<Node[]>((resolve, reject) => {
    let nodes: Node[] = [];
    const ws = new WebSocket(
      `wss://${homeeId}.hom.ee/connection?access_token=${accessToken}`,
      'v2'
    );

    ws.on('error', () => {
      reject(nodes);
    });

    ws.on('open', () => {
      ws.send('GET:nodes');
    });

    ws.on('message', (data: string) => {
      const dataObj: { nodes: Node[] } = JSON.parse(data);

      if (dataObj.nodes) {
        nodes = dataObj.nodes
          .filter((node) =>
            node.attributes.find(
              (attribute) => attribute.type === AttributeType.OnOff
            )
          )
          .map((node) => {
            return { ...node, name: decodeURIComponent(node.name) };
          })
          .sort((a, b) => a.order - b.order);
        ws.close();
      }
    });

    ws.on('close', () => {
      resolve(nodes);
    });
  });
}

export async function putAttribute(attributeID: number, targetValue: number) {
  return await fetch(
    `https://${homeeId}.hom.ee/api/v2/nodes/0/attributes?ids=${attributeID}&target_value=${targetValue}`,
    {
      method: 'PUT',
      headers: {
        Cookie: accessToken ?? '',
      },
    }
  );
}

export function getGroups() {
  return new Promise<Group[]>((resolve, reject) => {
    let groups: Group[] = [];
    const ws = new WebSocket(
      `wss://${homeeId}.hom.ee/connection?access_token=${accessToken}`,
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
        groups = dataObj.groups
          .filter((group) => group.category === GroupCategory.None)
          .map((group) => {
            return { ...group, name: decodeURIComponent(group.name) };
          })
          .sort((a, b) => a.order - b.order);
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
    `https://${homeeId}.hom.ee/api/v2/groups/${groupID}?attribute_type=${attributeType}&value=${targetValue}`,
    {
      method: 'PUT',
      headers: {
        Cookie: accessToken ?? '',
      },
    }
  );
}

export function getHomeegrams() {
  return new Promise<Homeegram[]>((resolve, reject) => {
    let homeegrams: Homeegram[] = [];
    const ws = new WebSocket(
      `wss://${homeeId}.hom.ee/connection?access_token=${accessToken}`,
      'v2'
    );

    ws.on('error', () => {
      reject(homeegrams);
    });

    ws.on('open', () => {
      ws.send('GET:homeegrams');
    });

    ws.on('message', (data: string) => {
      const dataObj: { homeegrams: Homeegram[] } = JSON.parse(data);

      if (dataObj.homeegrams) {
        homeegrams = dataObj.homeegrams
          .filter((homeegram) =>
            (homeegram.triggers.switch_triggers || []).some(
              (trigger: Trigger): boolean => trigger.id > 0
            )
          )
          .map((homeegram) => {
            return { ...homeegram, name: decodeURIComponent(homeegram.name) };
          })
          .sort((a, b) => a.order - b.order);
        ws.close();
      }
    });

    ws.on('close', () => {
      resolve(homeegrams);
    });
  });
}

export async function playHomeegram(homeegramID: number) {
  return await fetch(
    `https://${homeeId}.hom.ee/api/v2/homeegrams/${homeegramID}?play=1`,
    {
      method: 'PUT',
      headers: {
        Cookie: accessToken ?? '',
      },
    }
  );
}

export function getRelationships() {
  return new Promise<Relationship[]>((resolve, reject) => {
    let relationships: Relationship[] = [];
    const ws = new WebSocket(
      `wss://${homeeId}.hom.ee/connection?access_token=${accessToken}`,
      'v2'
    );

    ws.on('error', () => {
      reject(relationships);
    });

    ws.on('open', () => {
      ws.send('GET:relationships');
    });

    ws.on('message', (data: string) => {
      const dataObj: { relationships: Relationship[] } = JSON.parse(data);

      if (dataObj.relationships) {
        relationships = dataObj.relationships;
        ws.close();
      }
    });

    ws.on('close', () => {
      resolve(relationships);
    });
  });
}
