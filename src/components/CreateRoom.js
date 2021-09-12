import React, { useState } from "react";
import { v1 as uuid } from "uuid";
import Navbar from './navbar'

const CreateRoom = (props) => {
    const [room, setroom] = useState("")
    const [msg, setmsg] = useState("Welcome")
    function create() {

        const id = uuid();
        props.history.push(`/room/${id}`);
    }
    function join() {
        if (room.length === 0) {
            setmsg("Room ID can't be empty")
            return;
        }
        props.history.push(`/room/${room}`);
    }


    return (
        <div className="xlg:container p-0">
            <Navbar />
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
