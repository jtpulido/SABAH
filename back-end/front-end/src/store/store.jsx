import { configureStore } from "@reduxjs/toolkit";
import { useCookies } from 'react-cookie';
import thunkMiddleware from "redux-thunk";
import authReducer, { setToken, setTipoUsuario } from "./authSlice";

function ConfigureAuthStore() {
  function useAuthCookies() {
    const [cookies] = useCookies(['token', 'tipo_usuario']);
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
      }
    },
  });
  store.dispatch(setToken(cookies.token));
  store.dispatch(setTipoUsuario(cookies.tipo_usuario));
  return store;
}

export default ConfigureAuthStore;
