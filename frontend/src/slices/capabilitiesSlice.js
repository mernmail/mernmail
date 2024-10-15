import { createSlice } from "@reduxjs/toolkit";

export const capabilitiesSlice = createSlice({
  name: "capabilities",
  initialState: {
    receiveCapabilities: {}
  },
  reducers: {
    setReceiveCapabilities: (state, action) => {
      if (action.payload && action.payload !== undefined)
        state.receiveCapabilities = action.payload;
    }
  }
});

export async function setCapabilities(dispatch) {
  let receiveCapabilities = {};
  try {
    const res = await fetch("/api/receive/capabilities", {
      method: "GET",
      credentials: "include"
    });
    const data = await res.json();
    if (res.status == 200) {
      receiveCapabilities = data;
    }
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    // Capabilities will not be set
  }
  dispatch(
    capabilitiesSlice.actions.setReceiveCapabilities(receiveCapabilities)
  );
}

export default capabilitiesSlice.reducer;
