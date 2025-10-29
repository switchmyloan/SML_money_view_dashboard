import './App.css'
import Home from '@pages/Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import About from '@pages/About'
import Blogs from '@pages/Blogs/Blogs'
import DefaultLayout from './layouts/DefaultLayout'
import BlogCreate from '@pages/Blogs/BlogsCreate'
import Faq from '@pages/FAQ/Faq'
import Press from '@pages/CMSManagement/PressRoom/Press'
import LoginPage from '@pages/Auth/LoginPage'
import ProtectedRoute from './components/ProtectedRoute';
import Testimonials from '@pages/CMSManagement/Testimonials/Testimonial';
import SigninUser from "@pages/LeadManagement/SignInUserApp/SigninUser"
import Leads from "@pages/LeadManagement/Leads/Leads"
import ArchiveUsers from "@pages/LeadManagement/ArchiveUsers/ArchiveUsers"
import OnBoardLender from "@pages/LenderManagement/OnBoardLender/OnBoardLender"
import ListOfLender from "@pages/LenderManagement/ListOfLenders/ListOfLenders"
import SocialIcons from "@pages/CMSManagement/Social/SocialIcons"
import Offers from "@pages/CMSManagement/Offers/Offers"
import Banner from "@pages/CMSManagement/Banners/Banner"
import TermsAndConditions from '@pages/CMSManagement/T&C/TermsAndConditions';
import NotFound from '@pages/NotFound';
import PrivacyPolicy from '@pages/CMSManagement/Privacy/PrivacyPolicy';
import Roles from "@pages/AdminManagement/Roles/Roles"
import Users from '@pages/AdminManagement/Users/Users';
import PushNotification from '@pages/PushNotification/PushNotification';
import LeadDetail from '@pages/LeadManagement/Leads/LeadDetail';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
          <Route element={<DefaultLayout />}>
            <Route index element={<Home />} />   {/* path="/" */}
            <Route path="about" element={<About />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="blog/create" element={<BlogCreate />} />
            <Route path="blog/:id" element={<BlogCreate />} />
            <Route path="faq" element={<Faq />} />
            <Route path="press" element={<Press />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="signin-user" element={<SigninUser />} />
            <Route path="logs" element={<Leads />} />
            <Route path="lead-detail/:id" element={<LeadDetail />} />
            <Route path="archive-users" element={<ArchiveUsers />} />
            <Route path="on-borde-lender-from" element={<OnBoardLender />} />
            <Route path="on-borde-lender-from/:id" element={<OnBoardLender />} />
            <Route path="list-of-lenders" element={<ListOfLender />} />
            <Route path="social-icons" element={<SocialIcons />} />
            <Route path="offer" element={<Offers />} />
            <Route path="banners" element={<Banner />} />
            <Route path="terms-conditions" element={<TermsAndConditions />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="roles" element={<Roles />} />
            <Route path="users" element={<Users />} />
            <Route path="push-notification" element={<PushNotification />} />
          <Route path="*" element={<NotFound />} />
          </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
