import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import "dayjs/locale/ko";
dayjs.locale("ko");

import { mui_theme } from "./mui_theme.ts";
import { store } from "./redux/store.ts";
import Login from "./routes/Login.tsx";
import Signup, { signupAction } from "./routes/Signup.tsx";
import MemberLayout from "./layouts/MemberLayout.tsx";
import NewMember from "./routes/NewMember.tsx";
import MainLayout, { registerPeer } from "./layouts/MainLayout.tsx";
import MyFiles from "./routes/MyFiles.tsx";
import Settings from "./routes/Settings.tsx";

const router = createBrowserRouter([
  {
    path: "member",
    element: <MemberLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <Signup />,
        action: signupAction,
      },
      {
        path: "new",
        element: <NewMember />,
      },
    ],
  },
  {
    path: "/",
    element: <MainLayout />,
    loader: registerPeer,
    children: [
      {
        path: "",
        element: <MyFiles />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={mui_theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
);
