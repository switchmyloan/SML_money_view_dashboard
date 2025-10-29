// components/ToastNotification.js
import { toast } from "react-hot-toast";

const ToastNotification = {
  success: (message, duration = 4000) => {
    toast.success(message, {
      duration,
      style: {
        background: "white",
        color: "green",
        padding: "12px 16px",
        borderRadius: "8px",
        fontWeight: 500,
        fontSize: "14px",
      },
    });
  },

  error: (message, duration = 4000) => {
    toast.error(message, {
      duration,
      style: {
        background: "white",
        color: "red",
        padding: "12px 16px",
        borderRadius: "8px",
        fontWeight: 500,
        fontSize: "14px",
      },
    });
  },

  warning: (message, duration = 4000) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-xs w-full bg-yellow-500 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium`}
        >
          {message}
        </div>
      ),
      { duration }
    );
  },
};

export default ToastNotification;
