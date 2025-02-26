import { AttributeType } from '../lib/enums';
import { putGroup } from '../lib/homee';

type Input = {
  id: number;
  value: number;
};

export default async function ({ id, value }: Input) {
  await putGroup(id, AttributeType.DimmingLevel, value);
}
