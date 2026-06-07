import { useEffect, useState } from "react";
import type { GameTable } from "../types/types";
import { loadTables, saveTables } from "./localStorage.ts";

export const useTables = (initial: GameTable[]) => {
    const [tables, setTables] = useState<GameTable[]>(() =>
        loadTables(initial)
    );

    useEffect(() => {
        saveTables(tables);
    }, [tables]);

    return [tables, setTables] as const;
};