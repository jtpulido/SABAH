import { configureStore } from "@reduxjs/toolkit";
import { useCookies } from 'react-cookie';
import thunkMiddleware from "redux-thunk";
import authReducer, { setSessionID, setTipoUsuario } from "./authSlice";

function ConfigureAuthStore() {
  function useAuthCookies() {
    const [cookies] = useCookies(['session', 'tipo_usuario']);
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
        sessionID: cookies.session || '',
        tipoUsuario: cookies.tipo_usuario || '',
      }
    },
  });
  store.dispatch(setSessionID(cookies.session));
  store.dispatch(setTipoUsuario(cookies.tipo_usuario));
  return store;
}

export default ConfigureAuthStore;
