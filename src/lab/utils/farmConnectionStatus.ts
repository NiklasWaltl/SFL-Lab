export type FarmConnectionStatusVariant = "warning" | "error";

export interface FarmConnectionStatusMessage {
  text: string;
  variant: FarmConnectionStatusVariant;
}

interface FarmConnectionStatusInput {
  farmId: number | null;
  apiKey: string | null;
  isMock: boolean;
  error: string | null;
  connectionAttempted: boolean;
}

export function getFarmConnectionStatusMessage({
  farmId,
  apiKey,
  isMock,
  error,
  connectionAttempted,
}: FarmConnectionStatusInput): FarmConnectionStatusMessage | null {
  if (error) {
    return {
      text: "Verbindung fehlgeschlagen – bitte Farm-ID und API Key prüfen",
      variant: "error",
    };
  }

  if (!connectionAttempted || !isMock) {
    return null;
  }

  if (!farmId) {
    return {
      text: "Keine echten Farmdaten – Farm-ID fehlt",
      variant: "warning",
    };
  }

  if (!apiKey) {
    return {
      text: "Keine echten Farmdaten – API Key fehlt",
      variant: "warning",
    };
  }

  return null;
}
