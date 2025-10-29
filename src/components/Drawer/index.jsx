// Drawer.jsx
import React from "react";

const Drawer = ({ isOpen, onClose, title, children }) => {
  return (
    <>
      {isOpen && (
        <div className="drawer drawer-end fixed inset-0 z-50">
          <input
            type="checkbox"
            className="drawer-toggle"
            checked={isOpen}
            readOnly
          />
          <div className="drawer-side">
            {/* Overlay */}
            <label
              className="drawer-overlay"
              onClick={onClose}
            ></label>

            {/* Drawer Content */}
            <div className="p-6 w-[28rem] min-h-full bg-base-100 shadow-xl overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{title}</h2>
                <button onClick={onClose} className="btn btn-sm">✕</button>
              </div>
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Drawer;

