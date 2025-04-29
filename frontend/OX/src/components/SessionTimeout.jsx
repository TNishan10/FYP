import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Modal } from 'antd';
import { toast } from 'react-toastify';

const SESSION_TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const WARNING_BEFORE_TIMEOUT = 1 * 60 * 1000; // Show warning 1 minutes before timeout

export function SessionTimeout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [warningTimer, setWarningTimer] = useState(null);
  const [logoutTimer, setLogoutTimer] = useState(null);

  const resetTimers = () => {
    if (warningTimer) clearTimeout(warningTimer);
    if (logoutTimer) clearTimeout(logoutTimer);

    const newWarningTimer = setTimeout(() => {
      setShowTimeoutWarning(true);
    }, SESSION_TIMEOUT_DURATION - WARNING_BEFORE_TIMEOUT);

    const newLogoutTimer = setTimeout(() => {
      handleTimeout();
    }, SESSION_TIMEOUT_DURATION);

    setWarningTimer(newWarningTimer);
    setLogoutTimer(newLogoutTimer);
    setLastActivity(Date.now());
  };

  const handleUserActivity = () => {
    setLastActivity(Date.now());
    if (showTimeoutWarning) {
      setShowTimeoutWarning(false);
    }
    resetTimers();
  };

  const handleTimeout = () => {
    setShowTimeoutWarning(false);
    logout();
    toast.info("You've been logged out due to inactivity", {
      position: "top-center",
      autoClose: 5000,
    });
    navigate('/login');
  };

  const handleStayLoggedIn = () => {
    setShowTimeoutWarning(false);
    resetTimers();
  };

  useEffect(() => {
    // Set up event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity);
    });

    // Initialize timers
    resetTimers();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      if (warningTimer) clearTimeout(warningTimer);
      if (logoutTimer) clearTimeout(logoutTimer);
    };
  }, []);

  return (
    <>
      <Modal
        title="Session Timeout Warning"
        open={showTimeoutWarning}
        onOk={handleStayLoggedIn}
        onCancel={handleTimeout}
        okText="Stay Logged In"
        cancelText="Logout"
      >
        <p>Your session is about to expire due to inactivity.</p>
        <p>You will be automatically logged out in 2 minutes.</p>
        <p>Click "Stay Logged In" to continue your session.</p>
      </Modal>
    </>
  );
}

export default SessionTimeout;