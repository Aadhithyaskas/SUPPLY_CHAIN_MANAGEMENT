import { BrowserRouter,Routes,Route } from "react-router-dom";

import FounderLogin from "../pages/FounderLogin";
import EmployeeLogin from "../pages/Login";
import VerifyOTP from "../pages/VerifyOTP";
import ForceChangePassword from "../pages/ForceChangePassword";
import AdminDashboard from "../pages/AdminDashboard";

function AppRoutes(){

 return(

  <BrowserRouter>

   <Routes>

    <Route path="/" element={<FounderLogin/>}/>
    <Route path="/employee-login" element={<EmployeeLogin/>}/>
    <Route path="/verify-otp" element={<VerifyOTP/>}/>
    <Route path="/change-password" element={<ForceChangePassword/>}/>
    <Route path="/admin-dashboard" element={<AdminDashboard/>}/>

   </Routes>

  </BrowserRouter>

 )

}

export default AppRoutes;
