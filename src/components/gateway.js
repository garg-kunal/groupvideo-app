import { useEffect, useRef, useState } from 'react';
// import './gateway.css';
import Axios from '../service'
import ClipLoader from "react-spinners/ClipLoader";

// Can be a string as well. Need to ensure each key-value pair ends with ;
// const override = css`
//   display: block;
//   margin: 0 auto;
//   border-color: red;
// `;


export default function Gateway(props) {

    const [loading, setloading] = useState(true);

    const myVideo = useRef();

    useEffect(() => {
        Axios.post('/join-room/' + props.match.params.roomID).then((res) => {
            console.log(res.data)
        }).catch((err) => console.log(err))

        // navigator.mediaDevices
        //     .getUserMedia({ video: true, audio: true })
        //     .then((stream) => {
        //         myVideo.current.srcObject = stream;
        //     });
    }, []);


    // const meetentry = () => {
    //     props.history.push('/meeting/' + props.match.params.roomID)
    // }
    return (
        <div className="container-fluid" style={{ padding: "0" }}>
            {loading ? <ClipLoader color={'red'} loading={loading}  size={150} /> :

                <div className="container gateway-container mx-auto mt-2 ">
                    <div className="justify-content-center order-1 ">
                        <video className="video-gateway"
                            playsInline
                            muted
                            ref={myVideo}
                            autoPlay
                        />
                    </div>
                    {/* <div className="gateway-info text-center order-2">
                        <h5>Welcome! <i></i>
                            <br />  All things are goods.</h5>
                        <button  className="btn btn-join-gateway">Join</button>
                    </div> */}
                </div>

            }
        </div>
    )
}

// export default Meetinggateway
