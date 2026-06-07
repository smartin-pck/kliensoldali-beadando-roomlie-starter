import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../store/store";
import type { GameTable, PendingTable } from "../../types/types";
import {getNeptunHeader} from "../../utils/headerHelper.ts";

interface TablesState {
    items: GameTable[];
    loading: boolean;
    error: string | null;
}

const initialState: TablesState = {
    items: [],
    loading: false,
    error: null,
};

const API_URL = import.meta.env.VITE_API_URL;

export const fetchTables = createAsyncThunk<GameTable[]>(
    "tables/fetchTables",
    async () => {
        const response = await fetch(`${API_URL}/tables`, {
            headers: {
                Accept: "application/json",
                ...getNeptunHeader(),
            },
        });

        if (!response.ok) {
            throw new Error("Nem sikerült lekérni az asztalokat.");
        }

        return await response.json();
    }
);

interface CreateTablePayload extends PendingTable {
    position: {
        x: number;
        y: number;
    };
}

interface UpdateTablePayload {
    id: number;
    table: Omit<GameTable, "id" | "position">;
}

interface UpdateTablePositionPayload {
    id: number;
    x: number;
    y: number;
}

const getAuthHeader = (token: string | null): Record<string, string> => {
    if (!token) {
        return {};
    }

    return {
        Authorization: `Bearer ${token}`,
    };
};

export const createTable = createAsyncThunk<
    GameTable,
    CreateTablePayload,
    { state: RootState }
>("tables/createTable", async (payload, thunkApi) => {
    const token = thunkApi.getState().auth.token;

    const response = await fetch(`${API_URL}/tables`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...getAuthHeader(token),
            ...getNeptunHeader(),
        },
        body: JSON.stringify({
            name: `${payload.color} ${payload.type}`,
            type: payload.type,
            category: payload.category,
            color: payload.color,
            status: payload.status,
            position: payload.position,
            isLocked: payload.isLocked,
        }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message ?? "Nem sikerült létrehozni az asztalt.");
    }

    return data;
});

export const updateTableOnServer = createAsyncThunk<
    GameTable,
    UpdateTablePayload,
    { state: RootState }
>("tables/updateTable", async ({ id, table }, thunkApi) => {
    const token = thunkApi.getState().auth.token;

    const response = await fetch(`${API_URL}/tables/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...getAuthHeader(token),
            ...getNeptunHeader(),
        },
        body: JSON.stringify({
            name: `${table.color} ${table.type}`,
            type: table.type,
            category: table.category,
            color: table.color,
            status: table.status,
            isLocked: table.isLocked,
        }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message ?? "Nem sikerült létrehozni az asztalt.");
    }

    return data;
});

export const updateTablePositionOnServer = createAsyncThunk<
    GameTable,
    UpdateTablePositionPayload,
    { state: RootState }
>("tables/updateTablePosition", async ({ id, x, y }, thunkApi) => {
    const token = thunkApi.getState().auth.token;

    const response = await fetch(`${API_URL}/tables/${id}/position`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...getAuthHeader(token),
            ...getNeptunHeader(),
        },
        body: JSON.stringify({ x, y }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message ?? "Nem sikerült menteni a pozíciót.");
    }

    return data;
});

export const deleteTableOnServer = createAsyncThunk<
    number,
    number,
    { state: RootState }
>("tables/deleteTable", async (id, thunkApi) => {
    const token = thunkApi.getState().auth.token;

    const response = await fetch(`${API_URL}/tables/${id}`, {
        method: "DELETE",
        headers: {
            Accept: "application/json",
            ...getAuthHeader(token),
            ...getNeptunHeader(),
        },
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? "Nem sikerült törölni az asztalt.");
    }

    return id;
});

const tablesSlice = createSlice({
    name: "tables",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTables.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTables.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchTables.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message ?? "Ismeretlen hiba történt.";
            })
            .addCase(createTable.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(updateTableOnServer.fulfilled, (state, action) => {
                const index = state.items.findIndex((table) => table.id === action.payload.id);

                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(updateTablePositionOnServer.fulfilled, (state, action) => {
                const index = state.items.findIndex((table) => table.id === action.payload.id);

                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(deleteTableOnServer.fulfilled, (state, action) => {
                state.items = state.items.filter((table) => table.id !== action.payload);
            })
            .addMatcher(
                (action) =>
                    action.type.startsWith("tables/") &&
                    action.type.endsWith("/rejected"),
                (state, action) => {
                    state.loading = false;
                    state.error = action.error.message ?? "Asztal művelet sikertelen.";
                }
            );
    },
});

export default tablesSlice.reducer;