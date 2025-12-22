import { Navigate, Route, Routes } from "react-router-dom";
import Auth from "./pages/auth";
import Profile from "./pages/profile";
import Chat from "./pages/chat";
import { useEffect, useState } from "react";
import { useAppStore } from "./store";
import { authClient } from "./lib/auth-client";

const PrivateRoute = ({ children }) => {
  // console.log("yaha pe aaya uhu");

  const { userInfo } = useAppStore();
  if (userInfo === undefined) {
    // Optionally, add a loading spinner if data is still being fetched
    return <div className="inset-0 h-full w-full flex items-center justify-center"><span class="loader"></span></div>;
  }
  const isAuthenticated = !!userInfo;
  // console.log("isAuthenticated",isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

const AuthRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? <Navigate to="/chat" /> : children;
};

function App() {
  const { userInfo, setUserInfo } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {        
        // Add a small delay to allow OAuth callback to complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const session = await authClient.getSession();

        // console.log("Session response:", session);
        if (session?.data?.user) {
          // console.log("Session user found:", session.data.user);
          setUserInfo(session.data.user);
        } else {
          console.log("No active session");
          setUserInfo(null);
        }
      } catch (error) {
        console.warn("Error fetching session:", error);
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
    
    // Re-check session when window regains focus (after OAuth redirect)
    const handleFocus = () => {
      // console.log("Window focused, rechecking session...");
      getUserData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []); // Run only once on mount

  if (loading) {
    return <div className="inset-0 h-[100vh] w-full flex items-center justify-center"><span class="loader"></span></div>;
  }

  return (
    <>
      <Routes>
        <Route
          path="/auth"
          element={
            <AuthRoute>
              <Auth />
            </AuthRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </>
  );
}

export default App;
