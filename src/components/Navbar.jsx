import { useState } from "react";
import clsx from "clsx";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import Micon from "@material-ui/icons/MicNoneOutlined";
import Micoff from "@material-ui/icons/MicOffOutlined";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ChatIcon from "@material-ui/icons/Chat";
import Avatar from "@material-ui/core/Avatar";
import RemoveIcon from "@material-ui/icons/Remove";
const drawerWidth = 400;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: drawerWidth,
  },
  title: {
    flexGrow: 1,
  },
  hide: {
    display: "none",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-start",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  },
}));

export default function PersistentDrawerRight(props) {
  const classes = useStyles();
  const theme = useTheme();
  const [head, setHead] = useState("Users");
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <Typography variant="h6" noWrap className={classes.title}>
            Let's Call
          </Typography>
          {props.name}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={() => {
              handleDrawerOpen();
              setHead("Chat");
            }}
            className={clsx(open && classes.hide)}
          >
            <ChatIcon />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={() => {
              handleDrawerOpen();
              setHead("Users");
            }}
            className={clsx(open && classes.hide)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader} />
      </main>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="right"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </div>
        <p className="text-lg mx-auto pb-2">{head}</p>
        <Divider />
        {head === "Users" ? (
          <div>
            {props.data.map((item, index) => (
              <div className="m-2 user-info-card" key={index}>
                <Avatar key={index}>
                  {item.name.toString().substr(0, 1).toUpperCase()}
                </Avatar>
                <p className="px-2">{item.name}</p>
                {item.audio ? <Micon /> : <Micoff />}
                {props.admin ? (
                  <IconButton
                    onClick={() => {
                      props.socket.current.emit("remove", item.id);
                    }}
                  >
                    <RemoveIcon />
                  </IconButton>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="messages">
            {props.chat.map((item, index) => (
              <div className="chatCard">
                <div className="chatbar">
                  <p key={index} style={{ color: "black" }}>
                    {item.name}
                  </p>
                  <p key={index} style={{ color: "black" }}>
                    {item.time}
                  </p>
                </div>
                <p key={index} style={{ color: "black" }}>
                  {item.message}
                </p>
              </div>
            ))}
          </div>
        )}
        <Divider />
        {head === "Users" ? null : (
          <div className="msg-bar">
            <input
              type="text"
              classname="form-control w-full border-0 "
              onChange={(e) => {
                setMsg(e.target.value);
              }}
              value={msg}
              placeholder="Type message"
            />
            <span
              onClick={(e) => {
                if (msg.length !== 0) {
                  e.preventDefault();
                  console.log(props.socket);
                  props.socket.current.emit("newMessage", {
                    message: msg,
                    roomID: props.room,
                    name: props.name,
                  });
                  setMsg("");
                }
              }}
            >
              Send
            </span>
          </div>
        )}
      </Drawer>
    </div>
  );
}
