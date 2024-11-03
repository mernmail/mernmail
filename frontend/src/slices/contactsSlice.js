import { createSlice, current } from "@reduxjs/toolkit";
import { verificationFailed } from "@/slices/authSlice.js";

export const ContactsSlice = createSlice({
  name: "contacts",
  initialState: {
    loading: true,
    contacts: [],
    error: null,
    currentContact: null,
    currentContactName: null
  },
  reducers: {
    setContacts: (state, action) => {
      if (state.loading) state.loading = false;
      if (action.payload && action.payload.contacts !== undefined)
        state.contacts = action.payload.contacts;
      if (action.payload && action.payload.error !== undefined)
        state.error = action.payload.error;
    },
    setCurrentContactFromURL: (state) => {
      let contactName = null;
      try {
        const contactMatch = decodeURI(document.location.hash).match(
          /^#contact\/(.*)/
        );
        if (contactMatch) contactName = contactMatch[1];
        //eslint-disable-next-line no-unused-vars
      } catch (err) {
        // Hash URL parse error, use the first contact
      }
      if (contactName) {
        if (state.currentContact != contactName)
          state.currentContact = contactName;
        let currentContactName = state.currentContact;
        const currentContactObject = current(state.contacts).find(
          (contact) => contact.id == state.currentContact
        );
        if (currentContactObject) {
          currentContactName = currentContactObject.name;
        }
        state.currentContactName = currentContactName;
      }
    }
  }
});

export const { setCurrentContactFromURL } = ContactsSlice.actions;

export async function setContacts(dispatch, getState) {
  const state = { error: null };
  let email = getState().auth.email;
  if (email === null) {
    return;
  }
  try {
    const res = await fetch("/api/addressbook/contacts", {
      method: "GET",
      credentials: "include"
    });
    const data = await res.json();
    if (res.status == 200) {
      state.contacts = data.contacts;
    } else {
      if (res.status == 401) {
        dispatch(verificationFailed());
      }
      state.error = data.message;
    }
  } catch (err) {
    state.error = err.message;
  }
  dispatch(ContactsSlice.actions.setContacts(state));
}

export default ContactsSlice.reducer;
