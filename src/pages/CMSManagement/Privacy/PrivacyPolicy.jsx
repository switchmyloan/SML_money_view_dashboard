import React, { useEffect, useState } from "react";
import DataTable from "@components/Table/DataTable";
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getBlogs } from '@api/Modules/BlogsApi';
import ToastNotification from "@components/Notification/ToastNotification";
import { blogColumn } from "@components/TableHeader";
import { Editor, EditorState, RichUtils, convertToRaw } from "draft-js";
import "draft-js/dist/Draft.css"; // default styles import

const PrivacyPolicyModal = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: "",
    lastUpdated: "",
    sections: [{ title: "", content: EditorState.createEmpty() }],
  });

  if (!isOpen) return null;

  // Handle Editor change
  const handleEditorChange = (editorState, idx) => {
    const updatedSections = [...form.sections];
    updatedSections[idx].content = editorState;
    setForm({ ...form, sections: updatedSections });
  };

  // Save form (convert DraftJS content → raw JSON or HTML)
  const handleSubmit = () => {
    const finalData = {
      ...form,
      content:{
          data : form.sections.map((s) => ({
              title: s.title,
              content: JSON.stringify(convertToRaw(s.content.getCurrentContent())), // save as raw JSON
            })),
        }
    };
    onSave(finalData);
    onClose();
  };

  // Toggle inline styles (bold, italic etc.)
  const toggleInlineStyle = (idx, style) => {
    handleEditorChange(
      RichUtils.toggleInlineStyle(form.sections[idx].content, style),
      idx
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-50 w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold mb-4">Create Privacy Policy</h2>

        {/* Page Title + Last Updated */}
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
              placeholder="Enter Privacy Policy Title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input
              type="slug"
              name="Slug"
              value={form.slug}
              onChange={(e) =>
                setForm({ ...form, [e.target.sug]: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 bg-gray-50"
              placeholder="Enter Slug"
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
                className="px-2 py-1 border rounded"
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


// ------------------- Privacy Policy Table Page -------------------
const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [query, setQuery] = useState({
    limit: 10,
    page_no: 1,
    search: "",
  });

  // Open Modal on Create
  const handleCreate = () => {
    setIsModalOpen(true);
  };

  // Save Modal Data
  const handleSave = (formData) => {
    console.log("Form submitted:", formData);
    // 🔹 TODO: API call to save in CMS
    ToastNotification.success("Privacy Policy Saved!");
  };

  // Fetch Table Data
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await getBlogs(query.page_no, query.limit, "");

      if (response?.data?.success) {
        setData(response?.data?.data?.data || []);
        setTotalDataCount(response?.data?.data?.pagination?.totalItems || 0);
      } else {
        ToastNotification.error("Error fetching data");
      }
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (data) => {
    navigate(`/blogs/${data?.id}`);
  };

  useEffect(() => {
    fetchBlogs();
  }, [query.page_no]);

  const onPageChange = (pageNo) => {
    setQuery((prevQuery) => ({
      ...prevQuery,
      page_no: pageNo.pageIndex + 1,
    }));
  };

  return (
    <>
      <Toaster />
      <DataTable
        columns={blogColumn({ handleEdit })}
        title="Privacy Policy"
        data={data}
        totalDataCount={totalDataCount}
        onCreate={handleCreate}
        createLabel="Create"
        onPageChange={onPageChange}
        setPagination={setPagination}
        pagination={pagination}
        loading={loading}
      />

      {/* Modal */}
      <PrivacyPolicyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </>
  );
};

export default PrivacyPolicy;
