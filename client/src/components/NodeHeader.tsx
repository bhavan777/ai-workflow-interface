import { 
  getNodeColor, 
  getNodeType, 
  getStatusPillColor, 
  getStatusText, 
  getStatusIcon 
} from '@/lib/nodeUtils';

interface NodeHeaderProps {
  title: string;
  status: string;
}

export default function NodeHeader({ title, status }: NodeHeaderProps) {
  const nodeType = getNodeType(title);
  const nodeColor = getNodeColor(nodeType);

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${nodeColor.replace('text-', 'bg-')} bg-opacity-10`}>
          <span className={`text-sm font-semibold ${nodeColor}`}>
            {title.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className={`text-sm ${nodeColor} capitalize`}>{nodeType}</p>
        </div>
      </div>
      <div
        className={`px-3 py-1 rounded-full text-xs flex items-center gap-1.5 ${getStatusPillColor(status)}`}
      >
        {getStatusIcon(status)}
        <span>{getStatusText(status)}</span>
      </div>
    </div>
  );
}
