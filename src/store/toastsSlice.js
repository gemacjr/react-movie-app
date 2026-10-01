import { createSlice, nanoid } from "@reduxjs/toolkit";

const toastsSlice = createSlice({
  name: "toasts",
  initialState: {
    items: [],
  },
  reducers: {
    addToast: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      prepare({ message, type = "info" }) {
        return {
          payload: { id: nanoid(), message, type },
        };
      },
    },
    removeToast(state, action) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
  },
});

export const { addToast, removeToast } = toastsSlice.actions;
export default toastsSlice.reducer;
export const selectToasts = (state) => state.toasts.items;
