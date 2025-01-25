import io from 'socket.io-client';


const discussionsForumSocket = io('http://localhost:3000/forum', {
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });
  
export default discussionsForumSocket;