import React, { useState, useEffect } from "react";
import Background from "../../assets/login@4x.png";
import Victory from "../../assets/victory.svg";
import { Tabs } from "@/components/ui/tabs";
import { TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";
import { authClient } from "@/lib/auth-client";
import { FcGoogle } from "react-icons/fc";
// import { on } from "events";

const Auth = () => {
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Check for session after OAuth redirect
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          // console.log("OAuth session found:", session.data.user);
          setUserInfo(session.data.user);

          // Navigate based on profile setup
          if (session.data.user.profileSetup) {
            navigate("/chat");
          } else {
            navigate("/profile");
          }
        }
      } catch (error) {
        console.log("No session found after OAuth");
      }
    };

    checkSession();
  }, [navigate, setUserInfo]);

  const validateSignup = () => {
    if (!email.length) {
      toast.error("Email is required");
      return false;
    }
    if (!password.length) {
      toast.error("password is required");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("password and confirm passord should be same");
      return false;
    }

    return true;
  };

  const validateLogin = () => {
    if (!email.length) {
      toast.error("Email is required");
      return false;
    }
    if (!password.length) {
      toast.error("password is required");
      return false;
    }

    return true;
  };
  const handleLogin = async () => {
    const toastId = toast.loading("Loading...");
    if (validateLogin()) {
      try {
        const response = await authClient.signIn.email({
          email: email,
          password: password,
          rememberMe: true,
        });
        // console.log("i am just above the tost dismiss");

        // console.log("login response", response);
        if (response.data && response.data.user.id) {
          setUserInfo(response?.data?.user);
          if (response?.data?.user?.profileSetup) {
            navigate("/chat");
          } else {
            navigate("/profile");
          }
        }
      } catch (error) {
        console.error("Login API error:", error);

        toast.error("Login failed. Please try again.");
      }

      toast.dismiss(toastId);
    }
  };

  const handleLoginWithGoogle = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/auth`,
      });

      // The social sign-in will redirect to Google and back
      // After redirect, the session will be checked in App.jsx
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Google login failed. Please try again.");
    }
  };
  const handleSignup = async () => {
    let toastId;
    if (validateSignup()) {
      try {
        const response = await authClient.signUp.email(
          {
            name: email,
            email,
            password,
            rememberMe: true,
          },
          {
            onRequest: (ctx) => {
              toastId = toast.loading("Loading...");
            },
            onSuccess: (ctx) => {
              //redirect to the dashboard or sign in page
              toast.dismiss(toastId);
              navigate("/profile");
            },
            onError: (ctx) => {
              // display the error message
              // alert(ctx.error.message);
              toast.dismiss(toastId);
              throw new Error(ctx.error.message);
            },
          }
        );
        // console.log("signup response", response);
      } catch (error) {
        console.error("signup API error:", error);
        toast.error("signup failed. Please try again.");
      }
    }
    toast.dismiss(toastId);
  };

  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="h-[fit] bg-white border-2 border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2">
        <div className="flex flex-col gap-6 items-center justify-center py-10 px-5">
          <div className="flex items-center justify-center flex-col">
            <div className="flex items-center justify-center">
              <h1 className="text-5xl font-bold md:text-6xl"> Welcome</h1>
              <img src={Victory} alt="victory Emoji" className="h-[100px]" />
            </div>
            <p className="font-medium text-center ">
              Fill in the details to get started with the best chat app!
            </p>
          </div>
          <div className="flex items-center justify-center w-full">
            <Tabs className="w-3/4" defaultValue="login" >
              <TabsList className="flex bg-transparent rounded-none w-full ">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                >
                  Signup
                </TabsTrigger>
              </TabsList>
              <TabsContent className="flex flex-col gap-5 " value="login">
                <Input
                  placeholder="email"
                  type="email"
                  className="rounded-full p-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  placeholder="Password"
                  type="password"
                  className="rounded-full p-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button className="rounded-full p-6 " onClick={handleLogin}>
                  Login
                </Button>
              </TabsContent>
              <TabsContent className="flex flex-col gap-5 " value="signup">
                <Input
                  placeholder="email"
                  type="email"
                  className="rounded-full p-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  placeholder="Password"
                  type="password"
                  className="rounded-full p-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  placeholder="Confirm Password"
                  type="password"
                  className="rounded-full p-6"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button className="rounded-full p-6 " onClick={handleSignup}>
                  Sign Up
                </Button>
              </TabsContent>
            </Tabs>
          </div>
          <div className="w-3/4 mb-5">
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-[1px] bg-gray-300"></div>
              <span className="text-gray-500 text-sm">OR</span>
              <div className="flex-1 h-[1px] bg-gray-300"></div>
            </div>
            <Button
              onClick={handleLoginWithGoogle}
              variant="outline"
              className="w-full rounded-full p-6 flex items-center justify-center gap-3 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              <FcGoogle className="text-2xl" />
              <span className="font-medium text-gray-700">
                Continue with Google
              </span>
            </Button>
          </div>
        </div>
        <div className="hidden xl:flex justify-center items-center">
          <img src={Background} alt="" className="" />
        </div>
      </div>
    </div>
  );
};

export default Auth;
