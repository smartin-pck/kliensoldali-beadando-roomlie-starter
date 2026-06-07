import { useEffect, useRef, useState } from "react";
import type { GameTable } from "../types/types";
import { DRAG_THRESHOLD } from "../types/constants";
import {
    clampPositionToRoom,
    getTableSize,
    hasCollisionWithTables,
    hasFreeSpaceWarning,
} from "../utils/tableUtils";
import "../style/styles.css";

interface TableProps {
    table: GameTable;
    tables: GameTable[];
    isSelected: boolean;
    onClick: () => void;
    onMove: (id: number, x: number, y: number) => void;
    roomSize: {
        width: number;
        height: number;
    };
    scaleX: number;
    scaleY: number;
    canMove: boolean;
}

function TableItem({
                       table,
                       tables,
                       isSelected,
                       onClick,
                       onMove,
                       roomSize,
                       scaleX,
                       scaleY,
                       canMove,
                   }: TableProps) {
    const size = getTableSize(table.type);
    const wasDragged = useRef(false);
    const hasWarning = hasFreeSpaceWarning(table, tables);
    const [previewPosition, setPreviewPosition] = useState(table.position);
    const finalPositionRef = useRef(table.position);

    useEffect(() => {
        setPreviewPosition(table.position);
        finalPositionRef.current = table.position;
    }, [table.position.x, table.position.y]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();

        if (!canMove || table.isLocked) {
            return;
        }


        const startX = e.clientX;
        const startY = e.clientY;
        const initialX = table.position.x;
        const initialY = table.position.y;

        wasDragged.current = false;
        document.body.style.userSelect = "none";

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            const logicalDx = dx / scaleX;
            const logicalDy = dy / scaleY;

            if (
                Math.abs(dx) > DRAG_THRESHOLD ||
                Math.abs(dy) > DRAG_THRESHOLD
            ) {
                wasDragged.current = true;
            }

            if (!wasDragged.current) {
                return;
            }

            const newX = initialX + logicalDx;
            const newY = initialY + logicalDy;

            const clamped = clampPositionToRoom(
                newX,
                newY,
                table.type,
                roomSize
            );

            const hasCollision = hasCollisionWithTables(
                clamped.x,
                clamped.y,
                table.type,
                tables,
                table.id
            );

            if (!hasCollision) {
                setPreviewPosition(clamped);
                finalPositionRef.current = clamped;
            }
        };

        const handleMouseUp = () => {
            document.body.style.userSelect = "";

            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);

            if (wasDragged.current) {
                onMove(
                    table.id,
                    finalPositionRef.current.x,
                    finalPositionRef.current.y
                );
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    return (
        <div
            onMouseDown={handleMouseDown}
            onClick={(e) => {
                e.stopPropagation();

                if (!wasDragged.current) {
                    onClick();
                }
            }}
            className={`table ${isSelected ? "selected" : ""} ${table.category} ${hasWarning ? "warning" : ""}`}
            style={{
                left: previewPosition.x,
                top: previewPosition.y,
                width: size.width,
                height: size.height,
            }}
        >
            <div
                style={{
                    backgroundColor: table.color,
                    opacity: table.status / 10,
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex: 0,
                }}
            />

            <span style={{ position: "relative", zIndex: 1 }}>
                {table.type}
            </span>
        </div>
    );
}

export default TableItem;