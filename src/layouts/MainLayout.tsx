import { Grid, Paper, Box } from "@mui/material";
import { useNavigate, Outlet } from "react-router-dom";

import { useAppSelector } from "../redux/store.ts";
import SideBar from "../components/SideBar.tsx";

function MainLayout() {
  const navigate = useNavigate();
  const userData = useAppSelector((state) => state.user.value);

  if (!userData.isAuthenticated || !userData.id) {
    navigate("/member/login");
  }
  return (
    <Box sx={{ flexGrow: 1, height: "100vh" }}>
      <Grid
        container
        p={2}
        spacing={2}
        flexWrap={"nowrap"}
        sx={{ height: "inherit" }}
      >
        <Grid item xs={"auto"}>
          <SideBar />
        </Grid>
        <Grid item xs>
          <Paper sx={{ height: "100%" }}>
            <Outlet />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default MainLayout;
