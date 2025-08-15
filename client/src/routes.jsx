import StartPage from "./components/StartPage/StartPage.jsx";
import RegisterPage from "./components/RegisterPage/RegisterPage.jsx";

const routes = [
    {
        path: '/',
        element: <StartPage />
    },
    {
        path: '/register',
        element: <RegisterPage />
    }
];

export default routes;