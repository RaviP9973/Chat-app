import { Button } from "@/components/ui/button";
import { Navigate, Route, Routes } from "react-router-dom";
import Auth from "./pages/auth";
import Profile from "./pages/profile";
import Chat from "./pages/chat";
import { useEffect, useState } from "react";
import { useAppStore } from "./store";
import apiClient from "./lib/api-client";
import { GET_USER_INFO } from "./utils/constants";

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      setLoading(true);
      try {
        // console.log("Fetching user info...");
        const response = await apiClient.get(GET_USER_INFO, {
          withCredentials: true,
        });

        if (response.status === 200 && response.data.id) {
          // console.log(response.data);
          setUserInfo(response.data); // Update user info instead of calling the function again
        } else {
          
          setUserInfo(null);
          throw new Error("Failed to fetch user data");
        }
      } catch (error) {
        console.warn("Error fetching user data:", error);
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    };

    if (!userInfo) {
      getUserData();
    }
  }, [userInfo]); // Removed `setUserInfo` to avoid unnecessary re-renders

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
