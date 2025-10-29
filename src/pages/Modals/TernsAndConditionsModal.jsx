import React, { useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";

const TermsAndConditionsModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [form, setForm] = useState({
    title: "",
    lastUpdated: "",
    sections: [{ title: "", content: EditorState.createEmpty() }],
  });

  // load edit data
  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        lastUpdated: initialData.lastUpdated || "",
        sections:
          initialData.sections?.map((s) => ({
            title: s.title,
            content: s.content
              ? EditorState.createWithContent(convertFromRaw(JSON.parse(s.content)))
              : EditorState.createEmpty(),
          })) || [{ title: "", content: EditorState.createEmpty() }],
      });
    } else {
      setForm({
        title: "",
        lastUpdated: "",
        sections: [{ title: "", content: EditorState.createEmpty() }],
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  // editor change
  const handleEditorChange = (editorState, idx) => {
    const updatedSections = [...form.sections];
    updatedSections[idx].content = editorState;
    setForm({ ...form, sections: updatedSections });
  };

  // inline styles
  const toggleInlineStyle = (idx, style) => {
    handleEditorChange(
      RichUtils.toggleInlineStyle(form.sections[idx].content, style),
      idx
    );
  };

  // save
  const handleSubmit = () => {
    const finalData = {
      ...form,
      sections: form.sections.map((s) => ({
        title: s.title,
        content: JSON.stringify(convertToRaw(s.content.getCurrentContent())),
      })),
    };
    onSave(finalData);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-gray-50 w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold mb-4">
          {initialData ? "Edit Terms & Conditions" : "Create Terms & Conditions"}
        </h2>

        {/* Title + Last Updated */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Page Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, [e.target.name]: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 bg-gray-50"
              placeholder="Enter Title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Last Updated Date
            </label>
            <input
              type="date"
              name="lastUpdated"
              value={form.lastUpdated}
              onChange={(e) =>
                setForm({ ...form, [e.target.name]: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 bg-gray-50"
            />
          </div>
        </div>

        {/* Sections */}
        <h3 className="text-lg font-semibold mt-6 mb-2">Sections</h3>
        {form.sections.map((section, idx) => (
          <div key={idx} className="border p-4 mb-4 rounded-lg">
            <label className="block text-sm font-medium mb-1">
              Section Title
            </label>
            <input
              type="text"
              value={section.title}
              onChange={(e) => {
                const updated = [...form.sections];
                updated[idx].title = e.target.value;
                setForm({ ...form, sections: updated });
              }}
              className="w-full border rounded-lg px-3 py-2 mb-3 bg-gray-50"
              placeholder="Enter Section Title"
            />

            <label className="block text-sm font-medium mb-1">
              Section Content
            </label>

            {/* Toolbar */}
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => toggleInlineStyle(idx, "BOLD")}
                className="px-2 py-1 border rounded font-bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => toggleInlineStyle(idx, "ITALIC")}
                className="px-2 py-1 border rounded italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => toggleInlineStyle(idx, "UNDERLINE")}
                className="px-2 py-1 border rounded underline"
              >
                U
              </button>
            </div>

            <div className="border rounded-lg p-2 bg-white min-h-[120px]">
              <Editor
                editorState={section.content}
                onChange={(state) => handleEditorChange(state, idx)}
                placeholder="Write section details..."
              />
            </div>
          </div>
        ))}

        {/* Add Section */}
        <button
          onClick={() =>
            setForm({
              ...form,
              sections: [
                ...form.sections,
                { title: "", content: EditorState.createEmpty() },
              ],
            })
          }
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          + Add Section
        </button>

        {/* Save + Cancel */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 mr-2 rounded-lg border border-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsModal;
