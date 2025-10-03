import Header from '../Header/Header.jsx'



const PageShell = ({mainView=null}) => {

    const footer = () => {
        return (
            <div className='w-full flex flex-col items-center justify-center bg-gray-300 text-[7px] p-0.5'>
                <span>Website by Ryan Spoonmore</span>
                <span>Icons courtesy of pictogrammers.com</span>
            </div>
        )
    }

    function renderView() {
        return (
            <div className='h-screen flex flex-col justify-between'>
                <Header />
                <div className='flex flex-grow-2 w-full'>
                    {mainView ? mainView() : <div>Main View</div>}
                </div>
                {footer()}
            </div>
        )
    }
    
    return renderView();
    
}

export default PageShell