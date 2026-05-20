import { useCallback, useState } from "react";
import { getFarmIdFromUrl } from "../services/playerApi";

const FARM_ID_STORAGE_KEY = "sfl_lab_farm_id";

export interface UseFarmIdResult {
  farmId: number | null;
  setFarmId: (id: number | null) => void;
}

function parseFarmId(value: string | null): number | null {
  if (!value) return null;

  const farmId = Number(value);
  return Number.isFinite(farmId) ? farmId : null;
}

function getInitialFarmId(): number | null {
  const urlFarmId = getFarmIdFromUrl();

  if (urlFarmId) {
    return urlFarmId;
  }

  return parseFarmId(localStorage.getItem(FARM_ID_STORAGE_KEY));
}

export function useFarmId(): UseFarmIdResult {
  const [farmId, setFarmIdState] = useState<number | null>(() =>
    getInitialFarmId(),
  );

  const setFarmId = useCallback((id: number | null) => {
    setFarmIdState(id);

    if (id !== null) {
      localStorage.setItem(FARM_ID_STORAGE_KEY, String(id));
      return;
    }

    localStorage.removeItem(FARM_ID_STORAGE_KEY);
  }, []);

  return { farmId, setFarmId };
}
