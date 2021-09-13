import React, { useState } from "react";
import Navbar from './navbar'
import Axios from '../service';
import Notification from "../notification";
import { toast } from "react-toastify";
const CreateRoom = (props) => {
    const [room, setroom] = useState("")
    const [msg, setmsg] = useState("Welcome")


    function create() {
        console.log('create room')
        Axios.post('/create-room').then((res) => {
            props.history.push({
                pathname: `/room/${res.data.roomId}`,
                state: { allowed: true }
            });
        }).catch((err) => { toast.error("Retry Later") })


    }
    function join() {
        if (room.length === 0) {
            setmsg("Room ID can't be empty")
            return;
        }

        props.history.push({
            pathname: `/room/${room}`,
            state: { allowed: true }
        });

       
    }


    return (
        <div className="xlg:container p-0">
            <Navbar />
            <Notification />
            <div class="box-border mt-16 rounded-md h-auto pb-8 lg:w-1/3 sm:w-1/2 p-4 mx-auto border-1 bg-gray-200">
                <p className="text-center m-4 text-lg font-bold">{msg}</p>
                <input className="form-control w-full p-2 border-0" type="text" placeholder="Enter Room Id" required value={room} onChange={(e) => { setmsg("Welcome"); setroom(e.target.value) }} />
                <button className="bg-blue-600 rounded-md p-2 justify-center mt-4 w-full" style={{ color: "white" }} onClick={join}>Join room</button>

                <center><p className="mt-2 justify-center items-center w-full">or</p></center>

                <button className="bg-blue-600 rounded-md p-2 justify-center mt-4 w-full" style={{ color: "white" }} onClick={create}>Create room</button>
            </div>
        </div>

    );
};

export default CreateRoom;
