import { useEffect, useRef, useState } from "react";
import TableItem from "./TableItem";
import type { GameTable, PendingTable } from "../types/types";
import { VIEWPORT } from "../types/constants";

interface RoomProps {
    tables: GameTable[];
    roomSize: {
        width: number;
        height: number;
    };
    selectedTableId: number | null;
    onSelectTable: (id: number | null) => void;
    onMoveTable: (id: number, x: number, y: number) => void;
    pendingTable: PendingTable | null;
    onPlacePendingTable: (x: number, y: number) => void;
    canMove: boolean;
}

function Room({
                  tables,
                  roomSize,
                  selectedTableId,
                  onSelectTable,
                  onMoveTable,
                  pendingTable,
                  onPlacePendingTable,
                  canMove,
              }: RoomProps) {
    const stageRef = useRef<HTMLDivElement | null>(null);
    const [stageSize, setStageSize] = useState({
        width: VIEWPORT.width,
        height: VIEWPORT.height,
    });

    useEffect(() => {
        const measure = () => {
            if (!stageRef.current) return;

            setStageSize({
                width: stageRef.current.clientWidth,
                height: stageRef.current.clientHeight,
            });
        };

        measure();

        const resizeObserver = new ResizeObserver(() => {
            measure();
        });

        if (stageRef.current) {
            resizeObserver.observe(stageRef.current);
        }

        window.addEventListener("resize", measure);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, []);

    const scaleX = stageSize.width / roomSize.width;
    const scaleY = stageSize.height / roomSize.height;

    const handleRoomClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!pendingTable) {
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const displayX = e.clientX - rect.left;
        const displayY = e.clientY - rect.top;

        const logicalX = Math.round(displayX / scaleX);
        const logicalY = Math.round(displayY / scaleY);

        onPlacePendingTable(logicalX, logicalY);
    };

    return (
        <div className="room-stage" ref={stageRef}>
            <div
                className="room-transform"
                style={{
                    width: roomSize.width,
                    height: roomSize.height,
                    transform: `scale(${scaleX}, ${scaleY})`,
                    transformOrigin: "top left",
                }}
            >
                <div
                    className="room"
                    style={{
                        width: roomSize.width,
                        height: roomSize.height,
                    }}
                    onClick={handleRoomClick}
                >
                    {tables.map((table) => (
                        <TableItem
                            key={table.id}
                            table={table}
                            tables={tables}
                            roomSize={roomSize}
                            scaleX={scaleX}
                            scaleY={scaleY}
                            isSelected={table.id === selectedTableId}
                            onClick={() =>
                                onSelectTable(table.id === selectedTableId ? null : table.id)
                            }
                            onMove={onMoveTable}
                            canMove={canMove}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Room;