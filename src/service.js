import axios from 'axios';


const instance = axios.create({
    baseURL: "https://groupvideo-backend.herokuapp.com/"
});


export default instance;

