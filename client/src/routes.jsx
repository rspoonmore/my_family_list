import StartPage from "./components/StartPage/StartPage.jsx";
import RegisterPage from "./components/RegisterPage/RegisterPage.jsx";
import UpdateUser from "./components/UpdateUser/UpdateUser.jsx";

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
    }
];

export default routes;