import './App.css'
import Home from '@pages/Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DefaultLayout from './layouts/DefaultLayout'
import LoginPage from '@pages/Auth/LoginPage'
import ProtectedRoute from './components/ProtectedRoute';
import Leads from "@pages/LeadManagement/Leads/Leads"
import NotFound from '@pages/NotFound';
import LeadDetail from '@pages/LeadManagement/Leads/LeadDetail';
import BusinessLoanDetail from '../src/pages/LeadManagement/BusinessLoans/BusinessLoanDetail';
import BusinessLoans from './pages/LeadManagement/BusinessLoans/BusinessLoans';
import MvIVRLogs from './pages/LeadManagement/IVRLogs/MvIVRLogs';
import MvIvrLogsDetail from './pages/LeadManagement/IVRLogs/MvrIvrLogsDetail';
import CRZypeSuccessLeads from './pages/LeadManagement/Zype/CRZypeSuccessLeads';
import CRZypeDetails from "./pages/LeadManagement/Zype/CrZypeDetails"
import MVKreditBee from './pages/KreditBee/MVKreditBee';
import MVKreditBeeDetail from './pages/KreditBee/MVKreditBeeDetail';
import KBMumbai from './pages/KreditBee/KBMumbai';
import KBMumbaiDetail from './pages/KreditBee/KBMumbaiDetail';
import KBBanglore from './pages/KreditBee/KBBanglore';
import KBBangloreDetail from './pages/KreditBee/KBBangloreDetail';
import MVSuccessLeads from './pages/LeadManagement/MVSuccessLeads';
import OfferLeads from './pages/LeadManagement/OfferLeads';
import OfferLeadDetail from './pages/LeadManagement/OfferLeadDetail';
import SelectedLenders from './pages/LeadManagement/SelectedLenders';
import SelectedLenderDetail from './pages/LeadManagement/SelectedLenderDetail';
import KBLendingPage from './pages/LeadManagement/KBLendingPage/KBLendingPage';
import KBLendingPageDetail from './pages/LeadManagement/KBLendingPage/KBLendingPageDetail';
import DraftLeadsNew from './pages/LeadManagement/DraftLeadsNew/DraftLeadsNew';
import DraftLeadsNewDetail from './pages/LeadManagement/DraftLeadsNew/DraftLeadsNewDetail';
import OfferLeadsAnalytics from './pages/LeadManagement/OfferLeadsAnalytics';
import LendingUserJourney from './pages/LeadManagement/LendingUserJourney/LendingUserJourney';
import LendingUserJourneyDetail from './pages/LeadManagement/LendingUserJourney/LendingUserJourneyDetail';
import UserTrack from './pages/LeadManagement/UserTrack/UserTrack';
import UserTrackDetail from './pages/LeadManagement/UserTrack/UserTrackDetail';
import ShortOfferLeads from './pages/LeadManagement/Short/ShortOfferLeads';
import ShortSelectedLenders from './pages/LeadManagement/Short/ShortSelectedLenders';
import ShortSelectedLenderDetail from './pages/LeadManagement/Short/ShortSelectedLenderDetail';
import ShortDraftLeads from './pages/LeadManagement/Short/ShortDraftLeads';
import ShortOfferLeadsAnalytics from './pages/LeadManagement/Short/ShortOfferLeadsAnalytics';
import MVSuccessDetail from './pages/LeadManagement/MVSuccessDetail';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
          <Route element={<DefaultLayout />}>
            <Route index element={<Home />} /> 
            <Route path="logs" element={<Leads />} />
            <Route path="business-loans" element={<BusinessLoans />} />
            <Route path="mv-ivr-logs" element={<MvIVRLogs />} />
            <Route path="lead-detail/:id" element={<LeadDetail />} />
            <Route path="business-loans/:id" element={<BusinessLoanDetail />} />
            <Route path="mv-ivr-logs/:id" element={<MvIvrLogsDetail />} />
            <Route path="cr-zype-success-leads" element={<CRZypeSuccessLeads />} />
            <Route path="cr-zype-success-leads/:id" element={<CRZypeDetails />} />
            <Route path="kb-success-leads" element={<MVKreditBee />} />
            <Route path="kb-success-leads/:id" element={<MVKreditBeeDetail />} />
            <Route path="mv-success-leads" element={<MVSuccessLeads />} />
            <Route path="mv-success-leads/:id" element={<MVSuccessDetail />} />
            <Route path="kb-mumbai-success-leads" element={<KBMumbai />} />
            <Route path="kb-mumbai-success-leads/:id" element={<KBMumbaiDetail />} />
            <Route path="kb-banglore-success-leads" element={<KBBanglore />} />
            <Route path="kb-banglore-success-leads/:id" element={<KBBangloreDetail />} />
            <Route path="offer-leads-analytics" element={<OfferLeadsAnalytics />} />
            <Route path="offer-leads" element={<OfferLeads />} />
            <Route path="offer-leads/:id" element={<OfferLeadDetail />} />
            <Route path="selected-lenders" element={<SelectedLenders />} />
            <Route path="selected-lenders/:id" element={<SelectedLenderDetail />} />
            <Route path="kb-lending-page" element={<KBLendingPage />} />
            <Route path="kb-lending-page/:id" element={<KBLendingPageDetail />} />
            <Route path="draft-leads-new" element={<DraftLeadsNew />} />
            <Route path="draft-leads-new/:id" element={<DraftLeadsNewDetail />} />
            <Route path="lending-user-journey" element={<LendingUserJourney />} />
            <Route path="lending-user-journey/:phone" element={<LendingUserJourneyDetail />} />
            <Route path="user-track" element={<UserTrack />} />
            <Route path="user-track/:phone" element={<UserTrackDetail />} />

            {/* Short Ticket CMS */}
            <Route path="short-offer-leads-analytics" element={<ShortOfferLeadsAnalytics />} />
            <Route path="short-offer-leads" element={<ShortOfferLeads />} />
            <Route path="short-offer-leads/:id" element={<OfferLeadDetail />} />
            <Route path="short-selected-lenders" element={<ShortSelectedLenders />} />
            <Route path="short-selected-lenders/:id" element={<ShortSelectedLenderDetail />} />
            <Route path="short-draft-leads" element={<ShortDraftLeads />} />
            <Route path="short-draft-leads/:id" element={<DraftLeadsNewDetail />} />

          <Route path="*" element={<NotFound />} />
          </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App