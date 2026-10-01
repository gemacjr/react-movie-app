import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeToast, selectToasts } from "../store/toastsSlice";
import "../css/Toast.css";

const DISMISS_MS = 3000;

function ToastItem({ toast }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const id = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, DISMISS_MS);
    return () => clearTimeout(id);
  }, [dispatch, toast.id]);

  return (
    <div className={`toast ${toast.type}`} role="status">
      <span>{toast.message}</span>
      <button
        type="button"
        className="toast-dismiss"
        aria-label="Dismiss"
        onClick={() => dispatch(removeToast(toast.id))}
      >
        ×
      </button>
    </div>
  );
}

export default function ToastHost() {
  const toasts = useSelector(selectToasts);

  return createPortal(
    <div className="toast-host" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>,
    document.body
  );
}
