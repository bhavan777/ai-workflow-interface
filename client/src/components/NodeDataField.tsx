import { CheckCircle, Circle } from 'lucide-react';

interface NodeDataFieldProps {
  fieldName: string;
  value: string;
  isFilled: boolean;
}

export default function NodeDataField({ fieldName, value, isFilled }: NodeDataFieldProps) {
  return (
    <div className="flex items-center space-x-2 py-1">
      {isFilled ? (
        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
      ) : (
        <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
      )}
      <span className="text-sm font-medium text-gray-700">{fieldName}:</span>
      <span
        className={`text-sm ${
          isFilled ? 'text-gray-900' : 'text-gray-400'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
