import type { GameTable } from "../types/types";
import { TABLE_COLORS, TABLE_TYPES, TABLE_CATEGORIES } from "../types/constants.ts";
import "../style/styles.css";
import TableBookingPanel from "./TableBookingPanel";

interface TableDetailsProps {
    table?: GameTable;
    onDelete: (id: number) => void;
    onStatusChange: (id: number, status: number) => void;
    onLockChange: (id: number, isLocked: boolean) => void;
    activePanel: "add" | "details";
    onChangePanel: (panel: "add" | "details") => void;
    onEdit: (id: number) => void;
    readonly?: boolean;
    showTabs?: boolean;
    showBooking?: boolean;
}

const getCategoryLabel = (category: string) => {
    const found = TABLE_CATEGORIES.find((c) => c.value === category);
    return found ? found.label : category;
};

const getTableTypeLabel = (type: string) => {
    const found = TABLE_TYPES.find((t) => t.value === type);
    return found ? found.label : type;
};

const getColorLabel = (color: string) => {
    const found = TABLE_COLORS.find((c) => c.value === color);
    return found ? found.label : color;
};

const getGeneratedName = (table: GameTable) => {
    const color = getColorLabel(table.color).toLowerCase();
    const type = getTableTypeLabel(table.type).toLowerCase();

    return `A ${color} ${type} asztalom`;
};

function TableDetails({
                          table,
                          onDelete,
                          onStatusChange,
                          onLockChange,
                          onEdit,
                          onChangePanel,
                          activePanel,
                          readonly = false,
                          showTabs = true,
                          showBooking = false,
                      }: TableDetailsProps) {
    if (!table) {
        return (
            <div className="table-details">
                {showTabs && (
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
                </div>)}


                <div className="table-details-card empty">
                    <h2 className="table-details-title">Asztal adatai</h2>
                    <p className="table-details-empty-text">
                        Válassz ki egy asztalt a részletek megjelenítéséhez.
                    </p>
                </div>
            </div>
        );
    }

    const displayName = getGeneratedName(table);
    const typeLabel = getTableTypeLabel(table.type);
    const categoryLabel = getCategoryLabel(table.category);
    const colorLabel = getColorLabel(table.color);

    return (
        <div className="table-details">
            {showTabs && (
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
            </div>)}

            <div className="table-details-card">
                <h2 className="table-details-title">{displayName}</h2>

                <div className="table-preview">
                    <div
                        className="table-preview-visual"
                        style={{ backgroundColor: table.color }}
                    />
                    <div className="table-preview-text">
                        <div className="table-preview-type">{typeLabel}</div>
                        <div className="table-preview-meta">
                            {categoryLabel} | {colorLabel} | {table.status}/10
                        </div>
                    </div>
                </div>

                <div className="table-details-divider" />

                <div className="table-details-grid">
                    <span className="label">Típus</span>
                    <span className="value">{typeLabel}</span>

                    <span className="label">Kategória</span>
                    <span className="value">{categoryLabel}</span>

                    <span className="label">Szín</span>
                    <span className="value">{colorLabel}</span>

                    <span className="label">Pozíció</span>
                    <span className="value">
                        {table.position.x}, {table.position.y}
                    </span>
                </div>

                <div className="table-status-block">
                    <div className="table-status-head">
                        <span className="label">Állapot</span>
                        <span className="status-value">{table.status} / 10</span>
                    </div>

                    <input
                        className="table-status-range"
                        type="range"
                        min="1"
                        max="10"
                        value={table.status}
                        disabled={readonly}
                        onChange={(e) =>
                            onStatusChange(table.id, Number(e.target.value))
                        }
                    />

                    <div className="table-status-scale">
                        <span>Rossz</span>
                        <span>Kiváló</span>
                    </div>
                </div>

                <label className="table-lock-row">
                    <input
                        type="checkbox"
                        checked={table.isLocked}
                        disabled={readonly}
                        onChange={(e) =>
                            onLockChange(table.id, e.target.checked)
                        }
                    />
                    <span className="lock-text">
                        Rögzített <span className="lock-note">(nem mozgatható)</span>
                    </span>
                </label>

                {!readonly && (
                    <>
                        <button
                            className="table-edit-button"
                            type="button"
                            onClick={() => onEdit(table.id)}
                        >
                            Asztal adatainak szerkesztése
                        </button>

                        <button
                            className="table-delete-button"
                            type="button"
                            onClick={() => onDelete(table.id)}
                        >
                            Asztal törlése
                        </button>
                    </>
                )}

                {showBooking && <TableBookingPanel table={table} />}

                {!readonly && (
                    <p className="table-details-help">
                        Az asztal helyének megváltoztatásához húzd a kívánt pozícióba.
                    </p>
                )}
            </div>
        </div>
    );
}

export default TableDetails;