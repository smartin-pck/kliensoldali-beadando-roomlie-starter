import type { GameTable } from "../types/types";
import "../style/styles.css";

interface SummaryPanelProps {
    tables: GameTable[];
}

function SummaryPanel({ tables }: SummaryPanelProps) {
    const getStats = (type: GameTable["type"]) => {
        const filtered = tables.filter((table) => table.type === type);
        const count = filtered.length;

        const averageStatus =
            count === 0
                ? 0
                : filtered.reduce((sum, table) => sum + table.status, 0) / count;

        return {
            count,
            averageStatus: averageStatus.toFixed(1),
        };
    };

    const foosballStats = getStats("foosball");
    const snookerStats = getStats("snooker");
    const airHockeyStats = getStats("air-hockey");

    return (
        <div className="summary-panel">
            <div className="summary-total">
                <div className="summary-label">Összesítő</div>
                <div className="summary-total-row">
                    <span className="summary-total-number">{tables.length}</span>
                    <span className="summary-total-text">asztal összesen</span>
                </div>
            </div>

            <div className="summary-card">
                <div className="summary-card-header">
                    <span className="summary-dot red"></span>
                    <span>Csocsó</span>
                </div>
                <div className="summary-card-meta">
                    <span>{foosballStats.count} db</span>
                    <span>ø {foosballStats.averageStatus}</span>
                </div>
            </div>

            <div className="summary-card">
                <div className="summary-card-header">
                    <span className="summary-dot green"></span>
                    <span>Biliárd</span>
                </div>
                <div className="summary-card-meta">
                    <span>{snookerStats.count} db</span>
                    <span>ø {snookerStats.averageStatus}</span>
                </div>
            </div>

            <div className="summary-card">
                <div className="summary-card-header">
                    <span className="summary-dot blue"></span>
                    <span>Léghoki</span>
                </div>
                <div className="summary-card-meta">
                    <span>{airHockeyStats.count} db</span>
                    <span>ø {airHockeyStats.averageStatus}</span>
                </div>
            </div>
        </div>
    );
}

export default SummaryPanel;