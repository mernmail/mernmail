import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    loading: true,
    error: null,
    email: null
  },
  reducers: {
    login: (state, action) => {
      if (state.loading) state.loading = false;
      if (action.payload && action.payload.error !== undefined)
        state.error = action.payload.error;
      if (action.payload && action.payload.email !== undefined) {
        state.email = action.payload.email;
      }
    },
    logout: (state) => {
      if (state.loading) state.loading = false;
      state.email = null;
    },
    verificationFailed: (state) => {
      if (state.loading) state.loading = false;
      state.error = null;
      state.email = null;
    }
  }
});

export const { verificationFailed } = authSlice.actions;

export function login(email, password) {
  return async (dispatch) => {
    const state = {};
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
        credentials: "include"
      });
      const data = await res.json();
      if (res.status == 200) {
        state.email = email;
        state.error = null;
      } else {
        state.error = data.message;
      }
    } catch (err) {
      state.error = err.message;
    }
    dispatch(authSlice.actions.login(state));
  };
}

export async function checkAuth(dispatch) {
  const state = {};
  try {
    const res = await fetch("/api/check", {
      method: "GET",
      credentials: "include"
    });
    if (res.status == 200) {
      const data = await res.json();
      state.email = data.email;
    }
  } catch (err) {
    state.error = err.message;
  }
  dispatch(authSlice.actions.login(state));
}

export async function logout(dispatch) {
  try {
    await fetch("/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({}),
      credentials: "include"
    });
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    // Logout failed
  }
  dispatch(authSlice.actions.logout());
}

export default authSlice.reducer;
