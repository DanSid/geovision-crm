//Auth
import Login from "../views/Authentication/LogIn/Login/Login";
import LoginSimple from "../views/Authentication/LogIn/LoginSimple";
import LoginClassic from "../views/Authentication/LogIn/LoginClassic";
import Signup from "../views/Authentication/SignUp/Signup";
import SignUpSimple from "../views/Authentication/SignUp/SignupSimple";
import SignupClassic from "../views/Authentication/SignUp/SignupClassic";
import LockScreen from "../views/Authentication/LockScreen";
import ResetPassword from "../views/Authentication/ResetPassword";
import Error503 from "../views/Authentication/Error503/Error503";

export const authRoutes = [
    { path: '/login', exact: true, component: Login },
    { path: '/login-simple', exact: true, component: LoginSimple },
    { path: '/login-classic', exact: true, component: LoginClassic },
    { path: '/signup', exact: true, component: Signup },
    { path: '/signup-simple', exact: true, component: SignUpSimple },
    { path: '/signup-classic', exact: true, component: SignupClassic },
    { path: '/lock-screen', exact: true, component: LockScreen },
    { path: '/reset-password', exact: true, component: ResetPassword },
    { path: '/error-503', exact: true, component: Error503 },
]