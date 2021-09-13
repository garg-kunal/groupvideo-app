
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Notification(props) {
    return (
        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            limit={1}
            // pauseOnFocusLoss
            // draggable
            pauseOnHover
        />

    )
}



export default Notification;