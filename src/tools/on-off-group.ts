import { AttributeType } from '../lib/enums';
import { putGroup } from '../lib/homee';

type Input = {
  id: number;
  value: 'on' | 'off';
};

export default async function ({ id, value }: Input) {
  await putGroup(id, AttributeType.OnOff, value === 'on' ? 1 : 0);
}
