import { configureStore } from "@reduxjs/toolkit";
import tablesReducer from "../features/tables/tablesSlice";
import authReducer from "../features/auth/authSlice";

export const store = configureStore({
    reducer: {
        tables: tablesReducer,
        auth: authReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;