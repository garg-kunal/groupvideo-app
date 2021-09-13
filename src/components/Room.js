import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import Navbar from './navbar';
import CallEndIcon from "@material-ui/icons/CallEnd";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import MicNoneOutlinedIcon from "@material-ui/icons/MicNoneOutlined";
import MicOffOutlinedIcon from "@material-ui/icons/MicOffOutlined";
import ScreenShareIcon from "@material-ui/icons/ScreenShare";
import IconButton from "@material-ui/core/IconButton";
import Axios from "../service";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-toastify";


const Video = (props) => {
    const ref = useRef();
    useEffect(() => {
        props.data.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }, []);

    return (
        <video className="video" playsInline autoPlay ref={ref} />
    );
}

const Room = (props) => {
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const [audio, setaudio] = useState(true);
    const [allowed, setallowed] = useState(false);
    const [video, setvideo] = useState(true);
    const roomID = props.match.params.roomID;
    const [loading, setloading] = useState(true);

    useEffect(() => {
        socketRef.current = io.connect("https://groupvideo-backend.herokuapp.com/", {
            transports: ['websocket']
        });

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {



            let person = prompt("Please enter your name:", "");
            if (person === null || person === "") {
                toast("Name is Required");
                window.location.href="/"
            } else {
                socketRef.current.emit("join room", roomID, person);
            }

            socketRef.current.on("all users", data => {
                setallowed(data.allowed)
                document.getElementById("myVideo").srcObject = stream;
                const peers = [];
                data.users.forEach(userID => {
                    const peer = createPeer(userID, socketRef.current.id, stream);
                    peersRef.current.push({
                        peerID: userID,
                        peer,
                    })
                    peers.push(peer);
                })
                setPeers(peers);
            })

            socketRef.current.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                })

                setPeers(users => [...users, peer]);
            });
            socketRef.current.on("removed", () => {
                window.location.href = "/"
            });

            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });
            socketRef.current.on('newUser', (data) => {
                console.log(data)
                if (window.confirm(data.name+" wants to join?")) {
                    socketRef.current.emit('confirm', props.match.params.roomID, data.socketId)
                }
                else {

                    socketRef.current.emit('remove', data.socketId)
                }
            })
        })






    }, []);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
        })

        return peer;
    }
    const ofVideo = () => {
        document.getElementById("myVideo").srcObject.getVideoTracks()
            .forEach((track) => (track.enabled = !video));
        setvideo(!video);
    }
    const ofaudio = () => {
        console.log(document.getElementById("myVideo").srcObject.getAudioTracks())
        document.getElementById("myVideo").srcObject.getAudioTracks()
            .forEach((track) => (track.enabled = !audio));
        setaudio(!audio)
    }
    const leaveCall = () => {
        document.getElementById("myVideo").srcObject.getTracks().forEach((track) => track.stop());
        // peersRef.current.destroy();
        // setPeers("");

        props.history.push('/')
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    if (!allowed) {
        return <div className="container-fluid" style={{ padding: "0" }}>
            {loading ? <center><ClipLoader color={'blue'} loading={loading} size={150} /></center> :

                <div className="container gateway-container mx-auto mt-2 ">
                    <div className="justify-content-center order-1 ">
                        <video className="video-gateway"
                            playsInline
                            muted
                            id="myVideo"
                            ref={userVideo}
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
    }

    return (
        <div className="xlg:container h-screen m-0 p-0 mx-auto bg-current main-container">
            <Navbar />
            <div class="video-container">
                <video className="video" id="myVideo" muted ref={userVideo} autoPlay playsInline />
                {peersRef.current.map((peer, index) => {
                    return (
                        <Video key={index} data={peer} />
                    );
                })}
            </div>
            <div className="footer">
                <div class="footer-btns">
                    {video ? <IconButton classes={{ label: "on" }} onClick={ofVideo}><VideocamIcon /></IconButton> :
                        <IconButton classes={{ label: "off" }} onClick={ofVideo}><VideocamOffIcon /></IconButton>}
                    <IconButton classes={{ label: "off" }} onClick={leaveCall}><CallEndIcon /></IconButton>
                    {audio ? <IconButton classes={{ label: "on" }} onClick={ofaudio}><MicNoneOutlinedIcon /> </IconButton> :
                        <IconButton classes={{ label: "off" }} onClick={ofaudio}><MicOffOutlinedIcon /> </IconButton>
                    }
                </div>
            </div>
        </div>
    );
};

export default Room;
