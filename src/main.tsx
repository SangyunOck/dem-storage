import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";

import { mui_theme } from "./mui_theme.ts";
import { store } from "./redux/store.ts";
import App from "./App";
import Login, { loginAction } from "./routes/Login.tsx";
import Signup, { signupAction } from "./routes/Signup.tsx";
import MemberLayout from "./layouts/MemberLayout.tsx";
import NewMember from "./routes/NewMember.tsx";

const router = createBrowserRouter([
  {
    path: "member",
    element: <MemberLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
        action: loginAction,
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
    element: <App />,
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
