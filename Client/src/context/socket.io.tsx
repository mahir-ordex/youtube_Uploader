import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: "friend_request" | "video_status" | "message";
  title: string;
  message: string;
  timestamp: Date;
  data?: any;
}

const socketContext = createContext<SocketContextType | null>(null);

const SocketProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      const newSocket = io("http://localhost:5000", {
        auth: { token },
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to server');
      });
      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from server');
      });

      newSocket.on('friend_request_received', (data) => {
        addNotification({
          id: Date.now().toString(),
          type: 'friend_request',
          title: 'New Friend Request',
          message: data.message,
          timestamp: new Date(),
          data
        });
      });
      newSocket.on("friend_request_received",(data)=>{
        addNotification({
          id: Date.now().toString(),
          type: 'friend_request',
          title: 'New Friend Request',
          message: data.message,
          timestamp: new Date(),
          data
        });
      })
            // Listen for video status updates
      newSocket.on('video_status_update', (data) => {
        addNotification({
          id: Date.now().toString(),
          type: 'video_status',
          title: 'Video Status Update',
          message: data.message,
          timestamp: new Date(),
          data
        });
      });

      setSocket(newSocket);

      return(
        newSocket.close()
      )
    }
  }, []);

  function addNotification(notification:Notification){
    setNotifications((prev) => [notification,...prev])
  }
  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <socketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        addNotification,
        clearNotifications,
      }}
    >
      {children}
    </socketContext.Provider>
  );
};

export default SocketProvider;
