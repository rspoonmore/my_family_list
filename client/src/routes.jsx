import StartPage from "./components/StartPage/StartPage.jsx";
import RegisterPage from "./components/RegisterPage/RegisterPage.jsx";
import PageShell from "./components/PageShell/PageShell.jsx";

const routes = [
    {
        path: '/',
        element: <PageShell mainView={StartPage} />
    },
    {
        path: '/register',
        element: <PageShell mainView={RegisterPage} />
    }
];

export default routes;