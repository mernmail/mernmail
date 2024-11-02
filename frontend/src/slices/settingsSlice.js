import { createSlice } from "@reduxjs/toolkit";
import { verificationFailed } from "@/slices/authSlice.js";

export const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    loading: true,
    identities: [],
    signature: "",
    error: null
  },
  reducers: {
    resetLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setSettings: (state, action) => {
      if (action.payload && action.payload.identities !== undefined)
        state.identities = action.payload.identities;
      if (action.payload && action.payload.signature !== undefined)
        state.signature = action.payload.signature;
      if (state.loading) state.loading = false;
      if (action.payload && action.payload.error !== undefined)
        state.error = action.payload.error;
    }
  }
});

export const { resetLoading } = settingsSlice.actions;

export function setIdentities(signal) {
  return async (dispatch, getState) => {
    const state = { error: null };
    let email = getState().auth.email;
    if (email === null) {
      return;
    }

    let aborted = false;

    try {
      const res = await fetch(`/api/settings/identities`, {
        method: "GET",
        credentials: "include",
        signal: signal
      });
      const data = await res.json();
      if (res.status == 200) {
        state.identities = data.identities;
      } else {
        if (res.status == 401) {
          dispatch(verificationFailed());
        }
        state.error = data.message;
      }
    } catch (err) {
      if (err.name == "AbortError") aborted = true;
      state.error = err.message;
    }

    if (!aborted) dispatch(settingsSlice.actions.setSettings(state));
  };
}

export function setSignature(signal) {
  return async (dispatch, getState) => {
    const state = { error: null };
    let email = getState().auth.email;
    if (email === null) {
      return;
    }

    let aborted = false;

    try {
      const res = await fetch(`/api/settings/signature`, {
        method: "GET",
        credentials: "include",
        signal: signal
      });
      const data = await res.json();
      if (res.status == 200) {
        state.signature = data.signature;
      } else {
        if (res.status == 401) {
          dispatch(verificationFailed());
        }
        state.error = data.message;
      }
    } catch (err) {
      if (err.name == "AbortError") aborted = true;
      state.error = err.message;
    }

    if (!aborted) dispatch(settingsSlice.actions.setSettings(state));
  };
}

export function prepareSettingsForComposer(signal) {
  return async (dispatch, getState) => {
    const state = { error: null };
    let email = getState().auth.email;
    if (email === null) {
      return;
    }

    let aborted = false;

    try {
      const res = await fetch(`/api/settings/identities`, {
        method: "GET",
        credentials: "include",
        signal: signal
      });
      const data = await res.json();
      if (res.status == 200) {
        state.identities = data.identities;
      } else {
        if (res.status == 401) {
          dispatch(verificationFailed());
        }
        state.error = data.message;
      }
    } catch (err) {
      if (err.name == "AbortError") aborted = true;
      state.error = err.message;
    }

    if (aborted) return;

    try {
      const res = await fetch(`/api/settings/signature`, {
        method: "GET",
        credentials: "include",
        signal: signal
      });
      const data = await res.json();
      if (res.status == 200) {
        state.signature = data.signature;
      } else {
        if (res.status == 401) {
          dispatch(verificationFailed());
        }
        state.error = data.message;
      }
    } catch (err) {
      if (err.name == "AbortError") aborted = true;
      state.error = err.message;
    }

    if (!aborted) dispatch(settingsSlice.actions.setSettings(state));
  };
}

export default settingsSlice.reducer;
