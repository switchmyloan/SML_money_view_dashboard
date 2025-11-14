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
          <Route path="*" element={<NotFound />} />
          </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
