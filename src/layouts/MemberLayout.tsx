import { Box, Container, useMediaQuery, useTheme } from "@mui/material";
import { Outlet } from "react-router";

function MemberLayout() {
  const theme = useTheme();
  const isMaxSize = useMediaQuery(theme.breakpoints.up("lg"));

  return (
    <Box sx={{ height: "100vh", flexGrow: 1 }}>
      <Container maxWidth={isMaxSize ? "sm" : "xs"}>
        <Outlet />
      </Container>
    </Box>
  );
}

export default MemberLayout;
