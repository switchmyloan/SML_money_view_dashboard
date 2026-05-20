import DisbursalDashboard from './DisbursalDashboard';

export default function MvDisbursalDashboard() {
    return (
        <DisbursalDashboard
            scope="mv"
            title="Quickloans Disbursal monitoring (High Ticket)"
            subtitle="Disbursals limited to phones present in offerLeads."
        />
    );
}
