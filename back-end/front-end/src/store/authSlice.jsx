import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    tipo_usuario: null, // nuevo campo
    id: null
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setTipoUsuario: (state, action) => { // nuevo reducer
      state.tipo_usuario = action.payload;
    },
    setId: (state, action) => { // nuevo reducer
      state.id = action.payload;
    },
    clearSession: (state) => {
      state.token = null;
      state.tipo_usuario = null; // limpia también el tipo_usuario
      state.id = null; // limpia también el id
    },clearCookies: () => {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'tipo_usuario=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  },
});

export const { setToken, setTipoUsuario, setId, clearSession ,clearCookies} = authSlice.actions;

export const selectToken = (state) => state.auth.token;
export const selectTipo = (state) => state.auth.tipo_usuario;
export const selectId = (state) => state.auth.id;

export default authSlice.reducer;
