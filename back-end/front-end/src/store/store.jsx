import { configureStore } from "@reduxjs/toolkit";
import thunkMiddleware from "redux-thunk";
import authReducer from "./authSlice";
const persistedUser = localStorage.getItem('user');
const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: [thunkMiddleware],
  preloadedState: {
    auth: {
      user: persistedUser ? JSON.parse(persistedUser) : null,
    },
  },
});

export default store;
