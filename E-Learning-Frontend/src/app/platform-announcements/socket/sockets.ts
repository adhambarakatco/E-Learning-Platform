import io from 'socket.io-client';


const platformAnnouncementSocket = io('http://localhost:3001/ws/platform/announcement');    

export { platformAnnouncementSocket };