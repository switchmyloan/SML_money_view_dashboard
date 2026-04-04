
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainTable from '../../components/Table/MainTable';
import { getSelectedLenders } from '../../api-services/Modules/Leads';
import { selectedLendersColumn } from '../../components/TableHeader';
import SummaryCards from '../../components/Table/SummaryCards';

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const SelectedLenders = () => {
  const navigate = useNavigate();
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredCount, setFilteredCount] = useState(0);
  const [tablePagination, setTablePagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [summaryData, setSummaryData] = useState({
    totalLeads: 0,
  });

  const [query, setQuery] = useState({
    page_no: 1,
    limit: 10,
    search: '',
  });

  const fetchSelectedLenders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSelectedLenders({
        perPage: query.limit,
        currentPage: query.page_no,
        search: query.search,
      });

      console.log(res?.data?.data, "res?.data?.success");
      if (res?.data?.success) {
        setRawData(res?.data?.data || []);
        setFilteredCount(res?.data?.pagination?.total || 0);
        setSummaryData({
          totalLeads: res?.data?.data?.summaryObj?.total || 0,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query.limit, query.page_no, query.search]);

  useEffect(() => {
    fetchSelectedLenders();
  }, [fetchSelectedLenders]);

  const onPageChange = useCallback((pageInfo) => {
    setTablePagination({
      pageIndex: pageInfo.pageIndex,
      pageSize: pageInfo.pageSize,
    });
    setQuery((prevQuery) => ({
      ...prevQuery,
      page_no: pageInfo.pageIndex + 1,
      limit: pageInfo.pageSize,
    }));
  }, []);

  const onSearchHandler = useCallback(term => {
    setQuery(prev => ({ ...prev, search: term, page_no: 1 }));
  }, []);

  const debouncedSearch = useMemo(() => debounce(onSearchHandler, 300), [onSearchHandler]);

  const handleEdit = (lead) => {
    navigate(`/selected-lenders/${lead.id}`, { state: { lead } });
  };

  return (
    <>
      <Toaster />
      <SummaryCards
        totalLeads={Number(summaryData.totalLeads) || 0}
        loading={loading}
      />
      <MainTable
        columns={selectedLendersColumn({ handleEdit })}
        data={rawData}
        totalDataCount={filteredCount}
        loading={loading}
        onPageChange={onPageChange}
        onSearch={debouncedSearch}
        onRefresh={fetchSelectedLenders}
      />
    </>
  );
};

export default SelectedLenders;
