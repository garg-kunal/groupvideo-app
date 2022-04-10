import { useState } from "react";
import Axios from "../service";
import { toast } from "react-toastify";

const CreateRoom = (props) => {
    const [room, setRoom] = useState("");
    const [msg, setMsg] = useState("Welcome");

    const create = () => {
        Axios.post("/create-room")
            .then((res) => {
                props.history.push({
                    pathname: `/room/${res.data.roomID}`,
                    state: { allowed: true },
                });
            })
            .catch((err) => {
                toast.error("Retry Later...");
            });
    };
    const join = () => {
        if (room.length === 0) {
            setMsg("RoomID can't be empty");
            return;
        }

        props.history.push({
            pathname: `/room/${room}`,
            state: { allowed: true },
        });
    };

    return (
        <div className="xlg:container p-0">
            <div className="box-border mt-16 rounded-md h-auto pb-8 lg:w-1/3 sm:w-1/2 p-4 mx-auto border-1 bg-gray-200">
                <p className="text-center m-4 text-lg font-bold">{msg}</p>
                <input
                    className="form-control w-full p-2 border-0"
                    type="text"
                    placeholder="Enter Room ID"
                    required
                    value={room}
                    onChange={(e) => {
                        setMsg("Welcome");
                        setRoom(e.target.value);
                    }}
                />
                <button
                    className="bg-blue-600 rounded-md p-2 justify-center mt-4 w-full"
                    style={{ color: "white" }}
                    onClick={join}
                >
                    Join room
                </button>

                <p className="mt-2 flex justify-center items-center w-full">or</p>

                <button
                    className="bg-blue-600 rounded-md p-2 justify-center mt-4 w-full"
                    style={{ color: "white" }}
                    onClick={create}
                >
                    Create room
                </button>
            </div>
        </div>
    );
};

export default CreateRoom;
