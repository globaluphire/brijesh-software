import initialStatesSlice from "@/features/slice/initialStatesSlice";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
    reducer: {
        initialState: initialStatesSlice,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(),
});
