import { useEffect, useState } from "react";

import Room from "../components/Room";
import RoomControl from "../components/RoomControl";
import SummaryPanel from "../components/SummaryPanel";
import TableDetails from "../components/TableDetails";
import AddTableForm from "../components/AddTableForm";

import type { GameTable, PendingTable } from "../types/types";
import { DEFAULT_ROOM_SIZE } from "../types/constants";

import { useAppDispatch, useAppSelector } from "../store/hooks";

import {
    fetchTables,
    createTable,
    updateTableOnServer,
    updateTablePositionOnServer,
    deleteTableOnServer,
} from "../features/tables/tablesSlice";

import { clampPositionToRoom, hasCollisionWithTables } from "../utils/tableUtils";
import { useSearchParams } from "react-router-dom";

function RoomPage() {
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const {
        items: tables,
        loading,
        error,
    } = useAppSelector((state) => state.tables);

    const { user } = useAppSelector((state) => state.auth);

    const isLoggedIn = !!user;
    const isAdmin = user?.role?.toLowerCase() === "admin";

    const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
    const [roomSize, setRoomSize] = useState(DEFAULT_ROOM_SIZE);
    const [pendingTable, setPendingTable] = useState<PendingTable | null>(null);
    const [activePanel, setActivePanel] = useState<"add" | "details">("add");
    const [editingTableId, setEditingTableId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchTables());
    }, [dispatch]);

    useEffect(() => {
        if (searchParams.get("panel") === "add") {
            setActivePanel("add");
            setSelectedTableId(null);
            setEditingTableId(null);
            setPendingTable(null);
        }
    }, [searchParams]);

    const selectedTable = tables.find((table) => table.id === selectedTableId);
    const editingTable = tables.find((table) => table.id === editingTableId);

    const updateTablePosition = async (id: number, x: number, y: number) => {
        await dispatch(updateTablePositionOnServer({ id, x, y }));
    };

    const handleApplyRoomSize = (width: number, height: number) => {
        setRoomSize({ width, height });
        setSelectedTableId(null);
        setPendingTable(null);
        setEditingTableId(null);
    };

    const handleResetRoom = () => {
        dispatch(fetchTables());
        setSelectedTableId(null);
        setRoomSize(DEFAULT_ROOM_SIZE);
        setPendingTable(null);
        setEditingTableId(null);
        setActivePanel("add");
    };

    const handleUpdateTableStatus = async (id: number, status: number) => {
        const table = tables.find((t) => t.id === id);

        if (!table) {
            return;
        }

        await dispatch(
            updateTableOnServer({
                id,
                table: {
                    type: table.type,
                    category: table.category,
                    color: table.color,
                    status,
                    isLocked: table.isLocked,
                },
            })
        );
    };

    const handleDeleteTable = async (id: number) => {
        const result = await dispatch(deleteTableOnServer(id));

        if (deleteTableOnServer.fulfilled.match(result)) {
            if (selectedTableId === id) {
                setSelectedTableId(null);
            }

            if (editingTableId === id) {
                setEditingTableId(null);
            }

            alert("Asztal törölve.");
        } else {
            alert("Nem sikerült törölni az asztalt.");
        }
    };

    const handleUpdateTableLocked = async (id: number, isLocked: boolean) => {
        const table = tables.find((t) => t.id === id);

        if (!table) {
            return;
        }

        await dispatch(
            updateTableOnServer({
                id,
                table: {
                    type: table.type,
                    category: table.category,
                    color: table.color,
                    status: table.status,
                    isLocked,
                },
            })
        );
    };

    const handleCreatePendingTable = (table: PendingTable) => {

        setPendingTable(table);
        setEditingTableId(null);
        setSelectedTableId(null);
    };

    const handlePlacePendingTable = async (x: number, y: number) => {

        if (!pendingTable) {
            return;
        }

        const clamped = clampPositionToRoom(x, y, pendingTable.type, roomSize);

        const hasCollision = hasCollisionWithTables(
            clamped.x,
            clamped.y,
            pendingTable.type,
            tables
        );

        if (hasCollision) {
            alert("Ide nem helyezhető az asztal, mert ütközne egy másikkal.");
            return;
        }

        const result = await dispatch(
            createTable({
                ...pendingTable,
                position: clamped,
            })
        );

        if (createTable.fulfilled.match(result)) {
            setPendingTable(null);
            setSelectedTableId(result.payload.id);
            setActivePanel("details");
            alert("Asztal létrehozva.");
        } else {
            alert("Nem sikerült létrehozni az asztalt.");
        }
    };

    const handleSelectTable = (id: number | null) => {
        setSelectedTableId(id);

        if (id !== null) {
            setActivePanel("details");
            setEditingTableId(null);
        }
    };

    const handleChangePanel = (panel: "add" | "details") => {
        setActivePanel(panel);

        if (panel === "add") {
            setSelectedTableId(null);
        }

        if (panel === "details") {
            setPendingTable(null);
        }

        if (panel !== "add") {
            setEditingTableId(null);
        }
    };

    const handleUpdateTable = async (updatedTable: GameTable) => {
        const result = await dispatch(
            updateTableOnServer({
                id: updatedTable.id,
                table: {
                    type: updatedTable.type,
                    category: updatedTable.category,
                    color: updatedTable.color,
                    status: updatedTable.status,
                    isLocked: updatedTable.isLocked,
                },
            })
        );

        if (updateTableOnServer.fulfilled.match(result)) {
            setSelectedTableId(updatedTable.id);
            setEditingTableId(null);
            setActivePanel("details");
            alert("Asztal módosítva.");
        } else {
            alert("Nem sikerült módosítani az asztalt.");
        }
    };

    const handleEditTable = (id: number) => {
        setEditingTableId(id);
        setActivePanel("add");
        setPendingTable(null);
    };

    if (loading) {
        return <div className="app">Asztalok betöltése...</div>;
    }

    if (error) {
        return <div className="app">Hiba: {error}</div>;
    }

    return (
        <div className="app">
            <div className="app-shell">
                <RoomControl
                    roomSize={roomSize}
                    onApplyRoomSize={handleApplyRoomSize}
                    onResetRoom={handleResetRoom}
                />

                <div className="main-layout">
                    <div className="left-panel">
                        <Room
                            tables={tables}
                            roomSize={roomSize}
                            selectedTableId={selectedTableId}
                            onSelectTable={isLoggedIn ? handleSelectTable : () => {}}
                            onMoveTable={isAdmin ? updateTablePosition : () => {}}
                            pendingTable={isAdmin ? pendingTable : null}
                            onPlacePendingTable={isAdmin ? handlePlacePendingTable : () => {}}
                            canMove={isAdmin}
                        />

                        <SummaryPanel tables={tables} />
                    </div>

                    <div className="right-panel">
                        {!isLoggedIn && (
                            <div className="table-details-card empty">
                                <h2 className="table-details-title">Terem megtekintése</h2>
                                <p className="table-details-empty-text">
                                    Bejelentkezés nélkül az asztalok csak megtekinthetők.
                                </p>
                            </div>
                        )}

                        {isLoggedIn && !isAdmin && (
                            <TableDetails
                                table={selectedTable}
                                onDelete={() => {}}
                                onStatusChange={() => {}}
                                onLockChange={() => {}}
                                onEdit={() => {}}
                                activePanel="details"
                                onChangePanel={() => {}}
                                readonly
                                showTabs={false}
                                showBooking={!!selectedTable}
                            />
                        )}

                        {isAdmin && (
                            <>
                                {activePanel === "add" ? (
                                    <AddTableForm
                                        pendingTable={pendingTable}
                                        onCreatePendingTable={handleCreatePendingTable}
                                        onUpdateTable={handleUpdateTable}
                                        initialTable={editingTable}
                                        mode={editingTable ? "edit" : "create"}
                                        activePanel={activePanel}
                                        onChangePanel={handleChangePanel}
                                    />
                                ) : (
                                    <TableDetails
                                        table={selectedTable}
                                        onDelete={handleDeleteTable}
                                        onStatusChange={handleUpdateTableStatus}
                                        onLockChange={handleUpdateTableLocked}
                                        onEdit={handleEditTable}
                                        activePanel={activePanel}
                                        onChangePanel={handleChangePanel}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RoomPage;