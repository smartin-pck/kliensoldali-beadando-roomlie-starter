import type { GameTable, PendingTable } from "../types/types";
import { buildPlacedTable, clampPositionToRoom } from "./tableUtils.ts";

export const moveTable = (
    tables: GameTable[],
    id: number,
    x: number,
    y: number
): GameTable[] => {
    return tables.map((t) =>
        t.id === id ? { ...t, position: { x, y } } : t
    );
};

export const updateTableStatus = (
    tables: GameTable[],
    id: number,
    status: number
): GameTable[] => {
    return tables.map((t) =>
        t.id === id ? { ...t, status } : t
    );
};

export const updateTableLocked = (
    tables: GameTable[],
    id: number,
    isLocked: boolean
): GameTable[] => {
    return tables.map((t) =>
        t.id === id ? { ...t, isLocked } : t
    );
};

export const deleteTable = (
    tables: GameTable[],
    id: number
): GameTable[] => {
    return tables.filter((t) => t.id !== id);
};

export const updateTable = (
    tables: GameTable[],
    updated: GameTable
): GameTable[] => {
    return tables.map((t) =>
        t.id === updated.id ? updated : t
    );
};

export const placeTable = (
    tables: GameTable[],
    pending: PendingTable,
    x: number,
    y: number,
    roomSize: { width: number; height: number }
): GameTable[] => {
    const newTable = buildPlacedTable(pending, x, y, tables, roomSize);
    if (!newTable) return tables;

    return [...tables, newTable];
};

export const clampAllTablesToRoom = (
    tables: GameTable[],
    roomSize: { width: number; height: number }
): GameTable[] => {
    return tables.map((table) => {
        const clamped = clampPositionToRoom(
            table.position.x,
            table.position.y,
            table.type,
            roomSize
        );

        return {
            ...table,
            position: clamped,
        };
    });
};