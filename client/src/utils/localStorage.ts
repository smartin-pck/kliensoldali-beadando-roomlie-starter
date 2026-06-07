const KEY = "roomlie_tables";

export const loadTables = <T>(fallback: T): T => {
    const stored = localStorage.getItem(KEY);

    if (!stored) return fallback;

    try {
        return JSON.parse(stored);
    } catch {
        return fallback;
    }
};

export const saveTables = (tables: unknown) => {
    localStorage.setItem(KEY, JSON.stringify(tables));
};

export const clearTables = () => {
    localStorage.removeItem(KEY);
};