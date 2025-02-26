import { AttributeType } from '../lib/enums';
import { putGroup } from '../lib/homee';

type Input = {
  id: number;
  type: 'on-off' | 'dimm';
  value: number;
};

export default async function ({ id, type, value }: Input) {
  await putGroup(
    id,
    type === 'dimm' ? AttributeType.DimmingLevel : AttributeType.OnOff,
    value,
  );
}
