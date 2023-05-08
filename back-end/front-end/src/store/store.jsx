import { configureStore } from "@reduxjs/toolkit";
import { useCookies } from 'react-cookie';
import thunkMiddleware from "redux-thunk";
import authReducer, { setToken, setTipoUsuario, setId } from "./authSlice";

function ConfigureAuthStore() {
  function useAuthCookies() {
    const [cookies] = useCookies(['token', 'tipo_usuario', 'id']);
    return cookies;
  }

  const cookies = useAuthCookies();
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
    middleware: [thunkMiddleware],
    preloadedState: {
      auth: {
        token: cookies.token || '',
        tipoUsuario: cookies.tipo_usuario || '',
        id: cookies.id || ''
      }
    },
  });
  store.dispatch(setToken(cookies.token));
  store.dispatch(setTipoUsuario(cookies.tipo_usuario));
  store.dispatch(setId(cookies.id));
  return store;
}

export default ConfigureAuthStore;
