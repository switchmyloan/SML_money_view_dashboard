import { useEffect, useState, useCallback, useMemo } from 'react';
import DataTable from '@components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { leadsColumn, zypeSuccessColumn } from '../../../components/TableHeader';
import { useNavigate } from 'react-router-dom';
import { getCRZypeSuccessLeads, getMviIVRLogs } from '../../../api-services/Modules/Leads';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ToastNotification from '@components/Notification/ToastNotification'; // Assuming this component exists
import SummaryCards from '../../../components/Table/SummaryCards';
import { loadCache, saveCache } from '../../../utils/cache-idb';
import { processChunks } from '../../../utils/chunk';

const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

const CRZypeSuccessLeads = () => {
    const navigate = useNavigate();
    const [rawData, setRawData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exportDataList, setExportDataList] = useState([]);

    const [query, setQuery] = useState({
        page_no: 1,
        limit: 10,
        search: '',
        filter_date: 'today',
        startDate: null,
        endDate: null,
        status: 'success'
    });

    const [summaryMetrics, setSummaryMetrics] = useState({
        totalLeads: 0,
        successCount: 0,
        rejectCount: 0,
        duplicateCount: 0
    });

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {

            const res = await getCRZypeSuccessLeads();
            if (res?.data?.success) {
                setRawData(res.data.data || []);
            } else {
                ToastNotification.error('Failed to fetch logs');
            }
        } catch (err) {
            console.error(err);
            ToastNotification.error('Failed to fetch logs');
        } finally {
            setLoading(false);
        }
    }, []);

    const extractStatus = (msg = "") => {
        if (!msg) return "";
        const status = msg.split(":").pop().trim().toLowerCase();

        // Normalize ALL statuses here
        if (status === "accept") return "success";     // NEW FIX
        if (status === "reject") return "reject";
        if (status === "in_progress") return "in_progress";
        if (status === "pre_approval_in_progress") return "in_progress";

        return status;
    };


    //   const fetchLeads = useCallback(async () => {
    //   setLoading(true);

    //   try {
    //     // Try cache first
    //     const cached = await loadCache("mvi_ivr_logs");
    //     if (cached) {
    //       console.log("Loaded from cache (IndexedDB)");
    //       setRawData(cached);
    //       setLoading(false);
    //       return;
    //     }

    //     // Cache not found OR expired → API call
    //     console.log("Cache expired → API calling...");
    //     const res = await getMviIVRLogs(  
    //         query.filter_date,
    //         query.startDate,
    //         query.endDate); 

    //     if (res?.data?.success) {
    //       const apiData = res.data.data || [];

    //       // PROCESS DATA IN CHUNKS (no UI freeze)
    //       const processed = await processChunks(apiData, 5000);

    //       // Save cache for 10 minutes
    //       await saveCache("mvi_ivr_logs", processed, 5);

    //       setRawData(processed);
    //     } else {
    //       ToastNotification.error("Failed to fetch logs");
    //     }
    //   } catch (err) {
    //     console.error(err);
    //     ToastNotification.error("Failed to fetch logs");
    //   } finally {
    //     setLoading(false);
    //   }
    // }, [query.filter_date, query.startDate, query.fromDate]);

    useEffect(() => {
        let _list = [...rawData];

        if (query.filter_date) {
            const todayTimestamp = new Date().setHours(0, 0, 0, 0);
            const dateForYesterday = new Date();
            dateForYesterday.setDate(dateForYesterday.getDate() - 1);

            const yesterdayTimestamp = dateForYesterday.setHours(0, 0, 0, 0);

            _list = _list.filter(lead => {
                const leadDateTimestamp = new Date(lead.createdAt).setHours(0, 0, 0, 0);

                return query.filter_date === 'today'
                    ? leadDateTimestamp === todayTimestamp
                    : leadDateTimestamp === yesterdayTimestamp;
            });
        }

        // setSummaryMetrics({
        //     totalLeads: _list.length,
        //     successCount: _list.filter(lead => {
        //         const msg = lead?.lender_response?.MoneyView?.message || '';
        //         const got = msg.toLowerCase().trim();
        //         return got.includes('success');
        //     }).length,
        //     rejectCount: _list.filter(lead => {
        //         const msg = lead?.lender_response?.MoneyView?.message || '';
        //         const got = msg.toLowerCase().trim();
        //         return got.includes('lead has been rejected.');
        //     }).length,
        //     duplicateCount: _list.filter(lead => {
        //         const msg = lead?.lender_response?.MoneyView?.message || '';
        //         const got = msg.toLowerCase().trim();
        //         return got.includes('duplicate user (dedupe)');
        //     }).length
        // })

        setSummaryMetrics({
            totalLeads: _list.length,

            successCount: _list.filter(lead => {
                const msg = lead?.lender_response?.SMLCreadyZype?.message || '';
                return extractStatus(msg) === "success";   // ACCEPT counted
            }).length,

            rejectCount: _list.filter(lead => {
                const msg = lead?.lender_response?.SMLCreadyZype?.message || '';
                return extractStatus(msg) === "reject";
            }).length,

            duplicateCount: _list.filter(lead => {
                const msg = lead?.lender_response?.SMLCreadyZype?.message || '';
                return extractStatus(msg) === "duplicate";
            }).length,
        });

    }, [query.filter_date, query]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const { tableData, filteredCount } = useMemo(() => {
        let list = [...rawData];

        if (query.filter_date) {
            const todayTimestamp = new Date().setHours(0, 0, 0, 0);
            const dateForYesterday = new Date();
            dateForYesterday.setDate(dateForYesterday.getDate() - 1);
            const yesterdayTimestamp = dateForYesterday.setHours(0, 0, 0, 0);

            list = list.filter(lead => {
                const leadDateTimestamp = new Date(lead.createdAt).setHours(0, 0, 0, 0);

                return query.filter_date === 'today'
                    ? leadDateTimestamp === todayTimestamp
                    : leadDateTimestamp === yesterdayTimestamp;
            });
        }

        if (query.startDate && query.endDate) {
            const start = new Date(query.startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(query.endDate);
            end.setHours(23, 59, 59, 999);

            list = list.filter(lead => {
                const d = new Date(lead.createdAt);
                return d >= start && d <= end;
            });
        }

        // 3. STATUS FILTER
        // if (query.status) {
        //     const want = query.status.toLowerCase().trim();
        //     list = list.filter(lead => {
        //         const msg = lead?.lender_response?.MoneyView?.message || '';
        //         const got = msg.toLowerCase().trim();

        //         if (want === 'success') {
        //             return got.includes('success');
        //         }
        //         return got === want;
        //     });
        //     console.log(list, "list")
        // }
        if (query.status) {
            const want = query.status.toLowerCase().trim();

            list = list.filter(lead => {
                const msg = lead?.lender_response?.SMLCreadyZype?.message || '';
                const status = extractStatus(msg);
                return status === want;
            });
        }


        // 4. Search (FE fallback)
        if (query.search) {
            const s = query.search.toLowerCase();
            list = list.filter(lead =>
                `${lead.firstName} ${lead.lastName} ${lead.email} ${lead.phone}`
                    .toLowerCase()
                    .includes(s)
            );
        }

        setExportDataList(list);

        const count = list.length;
        const start = (query.page_no - 1) * query.limit;
        const pageData = list.slice(start, start + query.limit);

        return { tableData: pageData, filteredCount: count };
    }, [rawData, query]);

    const onPageChange = useCallback(p => {
        setQuery(prev => ({ ...prev, page_no: p.pageIndex + 1, limit: p.pageSize }));
    }, []);

    const handleStatusFilter = useCallback(newStatus => {
        setQuery(prev => ({ ...prev, status: newStatus, page_no: 1 }));
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

    const handleExport = () => {
        if (exportDataList.length === 0) {
            ToastNotification.info('No data to export based on current filters.');
            return;
        }

        const dataToExport = exportDataList.map(l => ({
            leadId: l?.lender_response?.MoneyView?.data?.resData?.data?.requestBody || 'N/A',
            Name: `${l?.firstName} ${l?.lastName}`,
            Phone: l?.phone,
            Email: l?.email,
            salary: l?.salary,
            // profession: l.profession,
            pincode: l?.pincode,
            // panNumber: l.panNumber,
            // is_moneyview_user: l.is_moneyview_user ? 'Yes' : 'No',
            // gender: l.gender,
            //   dob: l.dob ? new Date(l.dob).toLocaleDateString() : 'N/A',
            Status: l?.lender_response?.MoneyView?.message || 'N/A',
            Recevied_offer: l?.lender_response?.MoneyView?.data?.resData?.data?.response?.offerObjects[0]?.loanAmount || 'N/A',
            Created: new Date(l?.createdAt).toLocaleString()
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Leads');
        const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

        const now = new Date();

        const date = now.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).replace(/ /g, '-');

        const time = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        })
            .replace(/:/g, '-')
            .replace(' ', '');

        saveAs(
            new Blob([buf]),
            `SML_filtered_leads_export_${date}_${time}.xlsx`
        );
        ToastNotification.success('Exported successfully!');
    };

    const handleEdit = (lead) => {
        navigate(`/mv-ivr-logs/${lead.id}`, { state: { lead } });
    };

    


    return (
        <>
            <Toaster />
            <SummaryCards
                totalLeads={summaryMetrics.totalLeads}
                successCount={summaryMetrics.successCount}
                rejectCount={summaryMetrics.rejectCount}
                duplicateCount={summaryMetrics.duplicateCount}
                loading={loading}
            />
            <DataTable
                columns={zypeSuccessColumn({ handleEdit })}
                data={tableData}
                totalDataCount={filteredCount}
                loading={loading}
                onPageChange={onPageChange}
                onSearch={debouncedSearch}
                onRefresh={fetchLeads}
                onExport={handleExport}
                onCreate={() => navigate('/leads/create')}
                createLabel="Add Lead"
                title="CR Zype Success Leads"

                // Filters
                onFilterByDate={onFilterByDate}
                activeFilter={query.filter_date}
                onFilterByRange={onFilterByRange}
                activeDateRange={{ startDate: query.startDate, endDate: query.endDate }}

                // STATUS FILTER
                onFilterChange={handleStatusFilter}
                activeStatusFilter={query.status}
            />
        </>
    );
};

export default CRZypeSuccessLeads;