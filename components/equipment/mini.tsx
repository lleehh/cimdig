import type { Node, NodeProps } from '@xyflow/react';

 
type NumberNode = Node<{ number: number }, 'number'>;
 
export default function NumberNode({ data }: NodeProps<NumberNode>) {
  return <BreakerComponent displayName='breaker' equipment={data} />
}

<div>A special number: {data.number}</div>;
