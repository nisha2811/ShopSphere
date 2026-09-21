import { configureStore, createSlice } from '@reduxjs/toolkit';

const auth = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null
  },
  reducers: {
    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
    }
  }
});

export const store = configureStore({
  reducer: {
    auth: auth.reducer
  }
});

export const { setAuth, clearAuth: clearAuthAction } = auth.actions;

export function saveAuth(user, token)
{
  store.dispatch(setAuth({ user, token }));
}

export function clearAuth()
{
  store.dispatch(clearAuthAction());
}
