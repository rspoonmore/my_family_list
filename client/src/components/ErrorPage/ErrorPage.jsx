import PageShell from '../PageShell/PageShell';

const ErrorPage = () => {
    return <PageShell mainView={() => {return <div>There was an erorr loading this page. Please return to the Home screen.</div>}} />
}

export default ErrorPage