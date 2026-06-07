import { useState } from "react";
import type { PendingTable, TableType, TableCategory, GameTable } from "../types/types";
import {
    TABLE_TYPES,
    TABLE_CATEGORIES,
    TABLE_COLORS,
} from "../types/constants";
import "../style/styles.css";

interface AddTableFormProps {
    onCreatePendingTable: (table: PendingTable) => void;
    onUpdateTable?: (table: GameTable) => void;
    pendingTable: PendingTable | null;
    initialTable?: GameTable;
    mode: "create" | "edit";
    activePanel: "add" | "details";
    onChangePanel: (panel: "add" | "details") => void;
}

function AddTableForm({
                          activePanel,
                          onChangePanel,
                          onCreatePendingTable,
                          onUpdateTable,
                          pendingTable,
                          initialTable,
                          mode,
                      }: AddTableFormProps) {
    const [type, setType] = useState<TableType>(initialTable?.type ?? "foosball");
    const [category, setCategory] = useState<TableCategory>(initialTable?.category ?? "normal");
    const [color, setColor] = useState(initialTable?.color ?? "red");
    const [status, setStatus] = useState(initialTable?.status ?? 5);
    const isLocked = initialTable?.isLocked ?? false;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === "edit" && initialTable && onUpdateTable) {
            onUpdateTable({
                ...initialTable,
                type,
                category,
                color,
                status,
                isLocked,
            });
            return;
        }

        onCreatePendingTable({
            type,
            category,
            color,
            status,
            isLocked,
        });
    };

    return (
        <div className="table-details">
            <div className="table-details-tabs">
                <button
                    className={`table-details-tab ${activePanel === "add" ? "active" : ""}`}
                    type="button"
                    onClick={() => onChangePanel("add")}
                >
                    Új asztal
                </button>

                <button
                    className={`table-details-tab ${activePanel === "details" ? "active" : ""}`}
                    type="button"
                    onClick={() => onChangePanel("details")}
                >
                    Asztal adatai
                </button>
            </div>

            <div className="table-details-card">
                <h2 className="table-details-title">
                    {mode === "edit" ? "Asztal szerkesztése" : "Új asztal hozzáadása"}
                </h2>

                <form className="add-table-form" onSubmit={handleSubmit}>
                    <label className="form-field">
                        <span className="form-label">Típus</span>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as TableType)}
                        >
                            {TABLE_TYPES.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="form-field">
                        <span className="form-label">Kategória</span>
                        <select
                            value={category}
                            onChange={(e) =>
                                setCategory(e.target.value as TableCategory)
                            }
                        >
                            {TABLE_CATEGORIES.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="form-field">
                        <span className="form-label">Szín</span>
                        <select
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                        >
                            {TABLE_COLORS.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="table-status-block">
                        <div className="table-status-head">
                            <span className="label">Állapot</span>
                            <span className="status-value">{status} / 10</span>
                        </div>

                        <input
                            className="table-status-range"
                            type="range"
                            min="1"
                            max="10"
                            value={status}
                            onChange={(e) => setStatus(Number(e.target.value))}
                        />

                        <div className="table-status-scale">
                            <span>Rossz</span>
                            <span>Kiváló</span>
                        </div>
                    </div>

                    <button className="table-edit-button" type="submit">
                        {mode === "edit" ? "Módosítás mentése" : "Lehelyezés indítása"}
                    </button>
                </form>

                <p className="table-details-help">
                    {mode === "edit"
                        ? "Itt tudod módosítani a kiválasztott asztal adatait."
                        : pendingTable
                            ? "Kattints a teren belül a kívánt pozícióra az új asztal lerakásához."
                            : "Töltsd ki az adatokat, majd indítsd el a lehelyezést."}
                </p>
            </div>
        </div>
    );
}

export default AddTableForm;