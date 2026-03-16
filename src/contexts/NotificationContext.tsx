// /src/contexts/NotificationContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

type Notification = { id: number; message: string; type: 'info' | 'success' | 'warning' };

const NotificationContext = createContext({
  addNotification: (message: string, type: 'info' | 'success' | 'warning' = 'info') => {},
  notifications: [] as Notification[]
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
  };

  return (
    <NotificationContext.Provider value={{ addNotification, notifications }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map(n => (
          <div key={n.id} className={`p-4 rounded-lg shadow-lg ${n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'} text-white`}>
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
