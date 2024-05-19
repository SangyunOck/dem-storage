import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { Grid, Paper, Box, Stack } from "@mui/material";

import { useAppSelector } from "../redux/store.ts";
import SideBar from "../components/SideBar.tsx";
import AddFileBtn from "../components/AddFileBtn.tsx";
import UploadFileListBtn from "../components/UploadFileListBtn.tsx";

function MainLayout() {
  const navigate = useNavigate();
  const userData = useAppSelector((state) => state.user.value);

  useEffect(() => {
    // if (!userData.isAuthenticated || !userData.id) {
    //   navigate("/member/login");
    // }
    return () => {};
  }, [userData]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container p={2} spacing={2}>
        <Grid item xs={"auto"}>
          <SideBar />
        </Grid>
        <Grid item xs sx={{ height: "calc(100vh - 64px)" }}>
          <Box
            sx={{
              height: "100%",
              maxHeight: "100%",
              flexDirection: "column",
            }}
          >
            <Stack spacing={1} pb={1} direction={"row-reverse"}>
              <UploadFileListBtn />
              <AddFileBtn />
            </Stack>
            <Paper sx={{ height: "100%" }}>
              <Outlet />
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default MainLayout;
