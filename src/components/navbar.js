import React, { useState } from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CssBaseline from '@material-ui/core/CssBaseline';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Micon from "@material-ui/icons/MicNoneOutlined";
import Micoff from "@material-ui/icons/MicOffOutlined";
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChatIcon from '@material-ui/icons/Chat';
import Avatar from '@material-ui/core/Avatar';
import RemoveIcon from '@material-ui/icons/Remove';
import { deepOrange, deepPurple } from '@material-ui/core/colors';
const drawerWidth = 300;

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    appBar: {
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: drawerWidth,
    },
    title: {
        flexGrow: 1,
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: 'flex-start',
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginRight: -drawerWidth,
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: 0,
    },
}));

export default function PersistentDrawerRight(props) {
    console.log("navabr", props.chat)
    const classes = useStyles();
    const theme = useTheme();
    const [head, sethead] = useState("Users")
    const [msg, setmsg] = useState("")
    const [open, setOpen] = React.useState(false);

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
                        onClick={() => { handleDrawerOpen(); sethead("Chat") }}
                        className={clsx(open && classes.hide)}
                    >
                        <ChatIcon />
                    </IconButton>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="end"
                        onClick={() => { handleDrawerOpen(); sethead("Users") }}
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
                        {theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </div>
                <p className="text-lg mx-auto pb-2">{head}</p>
                <Divider />
                {head === 'Users' ?
                    <div>{props.data.map((item, index) =>
                        <div className="m-2 user-info-card">
                            <Avatar key={index}>{item.name.toString().substr(0, 1).toUpperCase()}</Avatar>
                            <p className="px-2">{item.name}</p>
                            {item.audio ? <Micon /> : <Micoff />}
                            {props.admin ? <IconButton onClick={() => { props.socket.current.emit('remove', item.id) }}><RemoveIcon /></IconButton> : null}

                        </div>

                    )}</div> : <div className="messages">
                        {props.chat.map((item, index) =>
                            <div className="chatCard">
                                <div className="chatbar">
                                    <p key={index} style={{ color: "black" }} >{item.name}</p>
                                    <p key={index} style={{ color: "black" }} >{item.time}</p>
                                </div>
                                <p key={index} style={{ color: "black" }} >{item.message}</p>
                            </div>
                        )}
                    </div>
                }
                <Divider />
                {head === 'Users' ? null : <div className="msg-bar">
                    <input type="text" classname="form-control w-full border-0 " onChange={(e) => { setmsg(e.target.value) }} value={msg} placeholder="Type message" />
                    <span onClick={(e) => {
                        if (msg.length !== 0) {
                            e.preventDefault();
                            console.log(props.socket)
                            props.socket.current.emit('newMessage', { message: msg, roomID: props.room, name: props.name })
                            setmsg("");
                        }
                    }}>Send</span>
                </div>}

            </Drawer>
        </div>
    );
}
