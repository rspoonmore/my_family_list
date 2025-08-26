import StartPage from "./components/StartPage/StartPage.jsx";
import RegisterPage from "./components/RegisterPage/RegisterPage.jsx";
import UpdateUser from "./components/UpdateUser/UpdateUser.jsx";
import ChangePassword from "./components/ChangePassword/ChangePassword.jsx";
import AdminPage from "./components/AdminPage/AdminPage.jsx";
import MembershipPage from "./components/MembershipPage/MembershipPage.jsx";

const routes = [
    {
        path: '/',
        element: <StartPage />
    },
    {
        path: '/register',
        element: <RegisterPage />
    },
    {
        path: '/users/:userid/update',
        element: <UpdateUser />
    },
    {
        path: '/users/:userid/password',
        element: <ChangePassword />
    },
    {
        path: '/admin-page',
        element: <AdminPage />
    },
    {
        path: '/memberships/:groupid',
        element: <MembershipPage />
    }
];

export default routes;