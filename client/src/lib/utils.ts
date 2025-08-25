import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse workflow description to extract source and destination names
 * Examples: "Shopify to Snowflake" -> { source: "Shopify", destination: "Snowflake" }
 *          "Salesforce to Mailchimp" -> { source: "Salesforce", destination: "Mailchimp" }
 */
export function parseWorkflowDescription(description: string): {
  source?: string;
  destination?: string;
  hasTransform?: boolean;
} {
  const trimmed = description.trim();

  // Check for "to" pattern (source to destination)
  const toPattern = /^(.+?)\s+to\s+(.+)$/i;
  const toMatch = trimmed.match(toPattern);

  if (toMatch) {
    return {
      source: toMatch[1].trim(),
      destination: toMatch[2].trim(),
      hasTransform: false,
    };
  }

  // Check for transformation patterns
  const transformPatterns = [
    /data\s+transformation/i,
    /transform\s+data/i,
    /clean\s+and\s+transform/i,
    /process\s+data/i,
  ];

  const isTransform = transformPatterns.some(pattern => pattern.test(trimmed));

  if (isTransform) {
    return {
      hasTransform: true,
    };
  }

  // Check for API to Database pattern
  const apiPattern = /^(.+?)\s+to\s+(.+)$/i;
  const apiMatch = trimmed.match(apiPattern);

  if (apiMatch) {
    return {
      source: apiMatch[1].trim(),
      destination: apiMatch[2].trim(),
      hasTransform: false,
    };
  }

  return {};
}

/**
 * Generate node names based on parsed workflow description
 */
export function generateNodeNames(description: string): {
  sourceName?: string;
  destinationName?: string;
  transformName?: string;
} {
  const parsed = parseWorkflowDescription(description);

  if (parsed.hasTransform) {
    return {
      transformName: 'Data Transform',
    };
  }

  if (parsed.source && parsed.destination) {
    return {
      sourceName: parsed.source,
      destinationName: parsed.destination,
    };
  }

  return {};
}
