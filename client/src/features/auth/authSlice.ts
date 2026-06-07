import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {getNeptunHeader} from "../../utils/headerHelper.ts";

export type UserRole = "user" | "admin" | "ADMIN" | "USER";

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: UserRole;
}

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

interface LoginPayload {
    email: string;
    password: string;
}

interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}

interface LoginResponse {
    token: string;
    user: AuthUser;
}

const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "roomlie_token";
const USER_KEY = "roomlie_user";

const storedToken = localStorage.getItem(TOKEN_KEY);
const storedUser = localStorage.getItem(USER_KEY);

const initialState: AuthState = {
    token: storedToken,
    user: storedUser ? JSON.parse(storedUser) : null,
    loading: false,
    error: null,
};

export const login = createAsyncThunk<LoginResponse, LoginPayload>(
    "auth/login",
    async (payload) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                ...getNeptunHeader(),
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error("Sikertelen bejelentkezés.");
        }

        return await response.json();
    }
);

export const register = createAsyncThunk<AuthUser, RegisterPayload>(
    "auth/register",
    async (payload) => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                ...getNeptunHeader(),
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(
                data?.message ??
                data?.error ??
                "Sikertelen regisztráció."
            );
        }

        return data.user;
    }
);

export const logout = createAsyncThunk<void, void, { state: { auth: AuthState } }>(
    "auth/logout",
    async (_, thunkApi) => {
        const token = thunkApi.getState().auth.token;

        if (token) {
            await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    ...getNeptunHeader(),
                },
            });
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearAuthError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;

                localStorage.setItem(TOKEN_KEY, action.payload.token);
                localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user));
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Sikertelen bejelentkezés.";
            })
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Sikertelen regisztráció.";
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.loading = false;
                state.error = null;

                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
            });
    },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;