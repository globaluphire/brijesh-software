import { setEncryptedItem } from "@/utils/encryptedStorage";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: {
        name: "",
        id: "",
        role: "",
        pickup_branch: "",
        drop_branch: ""
    },
    loggedIn: false,
};

export const initialStatesSlice = createSlice({
    name: "initialState",
    initialState,
    reducers: {
        setUserData: (state, { payload }) => {
            state.user = payload;
            state.loggedIn = !!payload.id;
            setEncryptedItem("user", JSON.stringify(state.user));
        },
    },
});

export const {
    setUserData,
} = initialStatesSlice.actions;
export default initialStatesSlice.reducer;
