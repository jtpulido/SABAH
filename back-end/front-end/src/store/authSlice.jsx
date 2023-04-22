import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    tipo_usuario: null, // nuevo campo
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setTipoUsuario: (state, action) => { // nuevo reducer
      state.tipo_usuario = action.payload;
    },
    clearSession: (state) => {
      state.token = null;
      state.tipo_usuario = null; // limpia también el tipo_usuario
    },clearCookies: () => {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'tipo_usuario=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  },
});

export const { setToken, setTipoUsuario, clearSession ,clearCookies} = authSlice.actions;

export const selectToken = (state) => state.auth.token;
export const selectTipo = (state) => state.auth.tipo_usuario;

export default authSlice.reducer;
