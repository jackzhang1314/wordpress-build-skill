export const connectorIds = ['apify', 'dataforseo', 'google', 'wordpress'] as const;
export type ConnectorId = typeof connectorIds[number];
export function isConnectorId(value: unknown): value is ConnectorId {
  return connectorIds.some(id => id === value);
}
