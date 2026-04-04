
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainTable from '../../components/Table/MainTable';
import { getOfferLeads } from '../../api-services/Modules/Leads';
import { offerLeadsColumn } from '../../components/TableHeader';
import SummaryCards from '../../components/Table/SummaryCards';

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const OfferLeads = () => {
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
    filter_date: '',
    startDate: null,
    endDate: null,
    minLoanAmount: '',
    maxLoanAmount: '',
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOfferLeads({
        perPage: query.limit,
        currentPage: query.page_no,
        search: query.search,
        type: query.filter_date || undefined,
        fromDate: query.startDate || undefined,
        toDate: query.endDate || undefined,
        minLoanAmount: query.minLoanAmount || undefined,
        maxLoanAmount: query.maxLoanAmount || undefined,
      });
      if (res?.data?.success) {
        setRawData(res?.data?.data?.data || []);
        setFilteredCount(res?.data?.data?.pagination?.total || 0);
        setSummaryData({
          totalLeads: res?.data?.data?.summaryObj?.total || 0,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query.limit, query.page_no, query.search, query.filter_date, query.startDate, query.endDate, query.minLoanAmount, query.maxLoanAmount]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

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

  const onFilterByDate = useCallback(type => {
    setQuery(prev => ({
      ...prev,
      filter_date: prev.filter_date === type ? '' : type,
      startDate: null,
      endDate: null,
      page_no: 1
    }));
  }, []);

  const onFilterByRange = useCallback(range => {
    setQuery(prev => ({
      ...prev,
      startDate: range.startDate,
      endDate: range.endDate,
      filter_date: '',
      page_no: 1
    }));
  }, []);

  const handleLoanAmountApply = useCallback(({ min, max }) => {
    setQuery(prev => ({ ...prev, minLoanAmount: min, maxLoanAmount: max, page_no: 1 }));
  }, []);

  const handleLoanAmountClear = useCallback(() => {
    setQuery(prev => ({ ...prev, minLoanAmount: '', maxLoanAmount: '', page_no: 1 }));
  }, []);

  const handleEdit = (lead) => {
    navigate(`/offer-leads/${lead.id}`, { state: { lead } });
  };

  return (
    <>
      <Toaster />
      <SummaryCards
        totalLeads={Number(summaryData.totalLeads) || 0}
        loading={loading}
      />
      <MainTable
        columns={offerLeadsColumn({ handleEdit })}
        data={rawData}
        totalDataCount={filteredCount}
        loading={loading}
        onPageChange={onPageChange}
        onSearch={debouncedSearch}
        onRefresh={fetchLeads}
        onFilterByDate={onFilterByDate}
        activeFilter={query.filter_date}
        onFilterByRange={onFilterByRange}
        activeDateRange={{ startDate: query.startDate, endDate: query.endDate }}
        onLoanAmountFilter={handleLoanAmountApply}
        onLoanAmountClear={handleLoanAmountClear}
        activeLoanAmount={{ min: query.minLoanAmount, max: query.maxLoanAmount }}
      />
    </>
  );
};

export default OfferLeads;
