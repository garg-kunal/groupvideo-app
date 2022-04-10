import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import Navbar from "./Navbar";
import CallEndIcon from "@material-ui/icons/CallEnd";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import MicNoneOutlinedIcon from "@material-ui/icons/MicNoneOutlined";
import MicOffOutlinedIcon from "@material-ui/icons/MicOffOutlined";
import IconButton from "@material-ui/core/IconButton";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-toastify";

const Video = (props) => {
  const ref = useRef();
  useEffect(() => {
    props.data.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, [props.data.peer]);

  return <video className="video" playsInline autoPlay ref={ref} />;
};

const Room = (props) => {
  const [peers, setPeers] = useState([]);
  const [username, setUsername] = useState("");
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const [admin, setAdmin] = useState(false);
  const [usersRef, setUserRef] = useState([]);
  const [chat, setChat] = useState([]);
  const [audio, setAudio] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [video, setVideo] = useState(true);
  const roomID = props.match.params.roomID;
  const [loading, setLoading] = useState(true);
  const [heading, setHeading] = useState("Setting up the room...");

  useEffect(() => {
    socketRef.current = io.connect(process.env.REACT_APP_ENDPOINT, {
      transports: ["websocket"],
    });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        let person = prompt("Please enter your name:", "");
        if (person === null || person === "") {
          toast("Name is Required");
          window.location.href = "/";
        } else {
          setUsername(person);
          setHeading("Connecting to the room...");
          socketRef.current.emit("join room", roomID, person, true, true);
        }

        socketRef.current.on("all users", (data) => {
          setAllowed(data.allowed);
          setAdmin(data.admin);
          setLoading(false);
          document.getElementById("myVideo").srcObject = stream;
          // const peers = [];
          data.users.forEach((userID) => {
            const peer = createPeer(userID, socketRef.current.id, stream);
            peersRef.current.push({
              peerID: userID,
              peer,
            });

            // peers.push(peer);
          });
          var userPeers = [];
          data.usersData.forEach((user) => {
            userPeers.push({
              id: user.id,
              name: user.name,
              audio: user.audio,
              video: user.video,
            });
          });
          setUserRef(userPeers);
          // setPeers(peers);
        });

        socketRef.current.on("user joined", (payload) => {
          const peer = addPeer(payload.signal, payload.callerID, stream);
          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });
          setPeers((users) => [...users, peer]);
        });
        socketRef.current.on("removed", () => {
          window.location.href = "/";
        });

        socketRef.current.on("receiving returned signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });
        socketRef.current.on("newUser", (data) => {
          if (window.confirm(data.name + " wants to join?")) {
            socketRef.current.emit(
              "confirm",
              props.match.params.roomID,
              data.socketId,
              data.name,
              true,
              true
            );
          } else {
            socketRef.current.emit("remove", data.socketId);
          }
        });

        socketRef.current.on("changeControl", (data) => {
          var userPeers = [];
          data.data.forEach((user) => {
            userPeers.push({
              id: user.id,
              name: user.name,
              audio: user.audio,
              video: user.video,
            });
          });
          setUserRef(userPeers);
        });
        socketRef.current.on("message", (data) => {
          setChat((chat) => [...chat, data]);
        });
      });
  }, [props.match.params.roomID, roomID]);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }
  const toggleVideo = () => {
    document
      .getElementById("myVideo")
      .srcObject.getVideoTracks()
      .forEach((track) => (track.enabled = !video));
    setVideo(!video);
    socketRef.current.emit("changeControls", roomID, username, !video, audio);
  };
  const toggleAudio = () => {
    document
      .getElementById("myVideo")
      .srcObject.getAudioTracks()
      .forEach((track) => (track.enabled = !audio));
    setAudio(!audio);
    socketRef.current.emit("changeControls", roomID, username, video, !audio);
  };
  const leaveCall = () => {
    document
      .getElementById("myVideo")
      .srcObject.getTracks()
      .forEach((track) => track.stop());
    socketRef.current.destroy();
    peers.forEach((peer) => peer.destroy());
    props.history.push("/");
  };

  if (!allowed && loading) {
    return (
      <div className="container-fluid" style={{ padding: "0" }}>
        <div className="flex flex-col h-screen justify-center items-center">
          <ClipLoader color={"blue"} loading={loading} size={150} />
          {heading}
        </div>
      </div>
    );
  }

  return (
    <div className="xlg:container h-screen m-0 p-0 mx-auto bg-current main-container">
      <Navbar
        data={usersRef}
        chat={chat}
        admin={admin}
        name={username}
        room={roomID}
        socket={socketRef}
      />
      <div className="video-container">
        <video
          className="video"
          id="myVideo"
          muted
          ref={userVideo}
          autoPlay
          playsInline
        />
        {peersRef.current.map((peer, index) => {
          return <Video key={index} data={peer} />;
        })}
      </div>
      <div className="footer">
        <div className="footer__actions">
          <IconButton
            classes={{ label: video ? "on" : "off" }}
            onClick={toggleVideo}
          >
            {video ? <VideocamIcon /> : <VideocamOffIcon />}
          </IconButton>
          <IconButton classes={{ label: "off" }} onClick={leaveCall}>
            <CallEndIcon />
          </IconButton>
          <IconButton
            classes={{ label: audio ? "on" : "off" }}
            onClick={toggleAudio}
          >
            {audio ? <MicNoneOutlinedIcon /> : <MicOffOutlinedIcon />}
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default Room;
