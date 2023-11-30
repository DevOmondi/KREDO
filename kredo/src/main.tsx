import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
// import App from "./App.tsx";
import Login from "./login/Login.tsx";
import Dashboard from "./dashboard/Dashboard.tsx";
import ChangePassword from "./password_change/ChangePassword.tsx";
import UserSignup from "./user_signup/UserSignup.tsx";
import RegisterUser from "./register_user/RegisterUser.tsx";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/change-password",
    element: <ChangePassword />,
  },
  {
    path: "/register-user",
    element: <RegisterUser />,
  },
  {
    path: "/user-signup",
    element: <UserSignup />,
  },
]);
// Customised theming
const colors = {
  primary: {
    default: "#7752FE",
    hover: "#000000",
  },
};
const theme = extendTheme({ colors });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <RouterProvider router={router} />
      {/* <App /> */}
    </ChakraProvider>
  </React.StrictMode>
);
