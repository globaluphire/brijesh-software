import { configureStore } from "@reduxjs/toolkit";
import jobSlice from "../features/job/jobSlice";
import toggleSlice from "../features/toggle/toggleSlice";
import filterSlice from "../features/filter/filterSlice";
import employerSlice from "../features/employer/employerSlice";
import employerFilterSlice from "../features/filter/employerFilterSlice";
import candidateSlice from "../features/candidate/candidateSlice";
import candidateFilterSlice from "../features/filter/candidateFilterSlice";
import shopSlice from "../features/shop/shopSlice";
import searchSlice from "../features/search/searchSlice";

export const store = configureStore({
    reducer: {
        job: jobSlice,
        toggle: toggleSlice,
        filter: filterSlice,
        employer: employerSlice,
        employerFilter: employerFilterSlice,
        candidate: candidateSlice,
        candidateFilter: candidateFilterSlice,
        shop: shopSlice,
        search: searchSlice,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(),
});
