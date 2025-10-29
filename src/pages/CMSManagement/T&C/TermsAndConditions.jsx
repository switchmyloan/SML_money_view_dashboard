import React, { useEffect, useState } from "react";
import DataTable from "@components/Table/DataTable";
import { Toaster } from "react-hot-toast";
import ToastNotification from "@components/Notification/ToastNotification";
import { blogColumn } from "@components/TableHeader";
import TermsAndConditionsModal from "../../Modals/TernsAndConditionsModal";

const TermsAndConditions = () => {
  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [query, setQuery] = useState({
    limit: 10,
    page_no: 1,
    search: "",
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fake API (replace later)
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = {
        success: true,
        data: [
          {
            id: 1,
            title: "Default Terms",
            lastUpdated: "2025-09-04",
            sections: [
              {
                title: "Introduction",
                content: JSON.stringify({
                  blocks: [
                    {
                      key: "6mgfh",
                      text: "These are the sample terms & conditions...",
                      type: "unstyled",
                      depth: 0,
                      inlineStyleRanges: [],
                      entityRanges: [],
                      data: {},
                    },
                  ],
                  entityMap: {},
                }),
              },
            ],
          },
        ],
        pagination: { totalItems: 1 },
      };

      if (response.success) {
        setData(response.data);
        setTotalDataCount(response.pagination.totalItems);
      } else {
        ToastNotification.error("Error fetching data");
      }
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setEditData(row);
    setIsModalOpen(true);
  };

  const handleSave = (form) => {
    if (editData) {
      console.log("Update:", form); // 🔹 Replace with update API
      ToastNotification.success("Terms & Conditions Updated!");
    } else {
      console.log("Create:", form); // 🔹 Replace with create API
      ToastNotification.success("Terms & Conditions Created!");
    }
    fetchData();
  };

  useEffect(() => {
    fetchData();
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
        title="Terms & Conditions"
        data={data}
        totalDataCount={totalDataCount}
        onCreate={handleCreate}
        createLabel="Create"
        onPageChange={onPageChange}
        setPagination={setPagination}
        pagination={pagination}
        loading={loading}
      />

      <TermsAndConditionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editData}
      />
    </>
  );
};

export default TermsAndConditions;
