export type TableType = "foosball" | "snooker" | "air-hockey";
export type TableCategory = "competition" | "normal" | "kids";

export interface Position {
    x: number;
    y: number;
}

export interface TableBase {
    type: TableType;
    category: TableCategory;
    color: string;
    status: number;
    isLocked: boolean;
}

export interface GameTable extends TableBase {
    id: number;
    position: Position;
}

export type PendingTable = TableBase;