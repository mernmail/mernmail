import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    loading: true,
    error: null,
    auth: null
  },
  reducers: {
    load: (state, action) => {
      if (state.loading) state.loading = false;
      if (action.payload && action.payload.error !== undefined)
        state.error = action.payload.error;
      if (action.payload && action.payload.auth !== undefined) {
        state.auth = action.payload.auth;
        if (!localStorage.getItem("credentials"))
          localStorage.setItem(
            "credentials",
            btoa(JSON.stringify(action.payload.auth))
          );
      }
    },
    login: (state, action) => {
      if (state.loading) state.loading = false;
      if (action.payload && action.payload.error !== undefined)
        state.error = action.payload.error;
      if (action.payload && action.payload.auth !== undefined) {
        state.auth = action.payload.auth;
        localStorage.setItem(
          "credentials",
          btoa(JSON.stringify(action.payload.auth))
        );
      }
    },
    logout: (state) => {
      if (state.loading) state.loading = false;
      localStorage.removeItem("credentials");
      state.auth = null;
    },
    verificationFailed: (state) => {
      if (state.loading) state.loading = false;
      state.error = null;
      state.auth = null;
    }
  }
});

export const { logout, verificationFailed } = authSlice.actions;

export async function load(dispatch) {
  const state = {};
  let credentials = {};
  try {
    credentials = JSON.parse(atob(localStorage.getItem("credentials")));
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    // Use empty credentials
  }
  try {
    const res = await fetch("/api/check", {
      method: "GET",
      headers: {
        Authorization:
          credentials.email && credentials.password
            ? "BasicMERNMail " +
              btoa(
                credentials.email.replace(/:/g, "") + ":" + credentials.password
              )
            : undefined
      }
    });
    if (res.status == 200) {
      state.auth =
        credentials.email && credentials.password
          ? { email: credentials.email, password: credentials.password }
          : {};
    }
  } catch (err) {
    state.error = err.message;
  }
  dispatch(authSlice.actions.load(state));
}

export function login(email, password) {
  return async (dispatch) => {
    const state = {};
    let credentials = {
      email: email,
      password: password
    };
    try {
      const res = await fetch("/api/check", {
        method: "GET",
        headers: {
          Authorization:
            credentials.email && credentials.password
              ? "BasicMERNMail " +
                btoa(
                  credentials.email.replace(/:/g, "") +
                    ":" +
                    credentials.password
                )
              : undefined
        }
      });
      const data = await res.json();
      if (res.status == 200) {
        state.auth =
          credentials.email && credentials.password
            ? { email: credentials.email, password: credentials.password }
            : {};
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

export async function checkAuth(dispatch, getState) {
  const state = {};
  let credentials = getState().auth.auth;
  if (credentials === null) {
    return;
  }
  try {
    const res = await fetch("/api/check", {
      method: "GET",
      headers: {
        Authorization:
          credentials.email && credentials.password
            ? "BasicMERNMail " +
              btoa(
                credentials.email.replace(/:/g, "") + ":" + credentials.password
              )
            : undefined
      }
    });
    if (res.status == 200) {
      state.auth =
        credentials.email && credentials.password
          ? { email: credentials.email, password: credentials.password }
          : {};
    } else {
      state.auth = null;
    }
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    // Don't display the message
  }
  dispatch(authSlice.actions.load(state));
}

export default authSlice.reducer;
