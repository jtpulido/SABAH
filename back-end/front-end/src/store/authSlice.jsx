import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    sessionID: null,
    tipo_usuario: null, // nuevo campo
  },
  reducers: {
    setSessionID: (state, action) => {
      state.sessionID = action.payload;
    },
    setTipoUsuario: (state, action) => { // nuevo reducer
      state.tipo_usuario = action.payload;
    },
    clearSession: (state) => {
      state.sessionID = null;
      state.tipo_usuario = null; // limpia también el tipo_usuario
    },clearCookies: () => {
      document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'tipo_usuario=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  },
});

export const { setSessionID, setTipoUsuario, clearSession ,clearCookies} = authSlice.actions;

export const selectUser = (state) => state.auth.sessionID;
export const selectTipo = (state) => state.auth.tipo_usuario;

export default authSlice.reducer;
