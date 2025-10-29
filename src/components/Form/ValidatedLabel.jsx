import React from "react";

function ValidatedLabel({ label, id, required = false }) {
  const mode = "light"; // replace with context/prop if needed

  return (
    <label
      id={id}
      className={`block mb-1 text-sm font-medium ${
        mode !== "light" ? "text-white" : "text-black"
      }`}
    >
      {label}{" "}
       {required && <span className="text-red-500">*</span>}
    </label>
  );
}

ValidatedLabel.defaultProps = {
  label: "Default Label",
  id: "default-id",
};

export default ValidatedLabel;
