import type { GameTable, PendingTable, TableType } from "../types/types";

export interface TableSize {
    width: number;
    height: number;
    freeSpace: number;
}

export const getTableSize = (type: TableType): TableSize => {
    switch (type) {
        case "snooker":
            return { width: 190, height: 100, freeSpace: 50 };
        case "air-hockey":
            return { width: 140, height: 70, freeSpace: 40 };
        case "foosball":
            return { width: 120, height: 60, freeSpace: 30 };
        default:
            return { width: 100, height: 50, freeSpace: 20 };
    }
};

export const isOverlapping = (
    x: number,
    y: number,
    width: number,
    height: number,
    freeSpace: number,
    otherTable: GameTable
): boolean => {
    const otherSize = getTableSize(otherTable.type);

    return !(
        x + width + freeSpace <= otherTable.position.x ||
        x - freeSpace >= otherTable.position.x + otherSize.width ||
        y + height + freeSpace <= otherTable.position.y ||
        y - freeSpace >= otherTable.position.y + otherSize.height
    );
};

export const hasCollisionWithTables = (
    x: number,
    y: number,
    type: TableType,
    tables: GameTable[],
    ignoreTableId?: number
): boolean => {
    const size = getTableSize(type);

    return tables.some((otherTable) => {
        if (ignoreTableId !== undefined && otherTable.id === ignoreTableId) {
            return false;
        }

        return isOverlapping(
            x,
            y,
            size.width,
            size.height,
            size.freeSpace,
            otherTable
        );
    });
};

export const clampPositionToRoom = (
    x: number,
    y: number,
    type: TableType,
    roomSize: { width: number; height: number },
) => {
    const size = getTableSize(type);

    const minX = size.freeSpace;
    const minY = size.freeSpace;
    const maxX = roomSize.width - size.width - size.freeSpace;
    const maxY = roomSize.height - size.height - size.freeSpace;

    return {
        x: Math.max(minX, Math.min(x, maxX)),
        y: Math.max(minY, Math.min(y, maxY)),
    };
};

export const hasFreeSpaceWarning = (
    table: GameTable,
    tables: GameTable[],
): boolean => {
    const size = getTableSize(table.type);

    return tables.some((otherTable) => {
        if (otherTable.id === table.id) {
            return false;
        }

        const otherSize = getTableSize(otherTable.type);

        return !(
            table.position.x + size.width + size.freeSpace <= otherTable.position.x ||
            table.position.x - size.freeSpace >= otherTable.position.x + otherSize.width ||
            table.position.y + size.height + size.freeSpace <= otherTable.position.y ||
            table.position.y - size.freeSpace >= otherTable.position.y + otherSize.height
        );
    });
};

export const buildPlacedTable = (
    pendingTable: PendingTable,
    x: number,
    y: number,
    tables: GameTable[],
    roomSize: { width: number; height: number },
): GameTable | null => {
    const clamped = clampPositionToRoom(x, y, pendingTable.type, roomSize);

    const hasCollision = hasCollisionWithTables(
        clamped.x,
        clamped.y,
        pendingTable.type,
        tables
    );

    if (hasCollision) {
        return null;
    }

    const newId =
        tables.length > 0 ? Math.max(...tables.map((table) => table.id)) + 1 : 1;

    return {
        id: newId,
        type: pendingTable.type,
        category: pendingTable.category,
        color: pendingTable.color,
        status: pendingTable.status,
        position: {
            x: clamped.x,
            y: clamped.y,
        },
        isLocked: pendingTable.isLocked,
    };
};