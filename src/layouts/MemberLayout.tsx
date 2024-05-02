import { Box, Container } from "@mui/material";
import { Outlet } from "react-router";

function MemberLayout() {
  return (
    <Box sx={{ height: "100vh", flexGrow: 1 }}>
      <Container maxWidth={"xs"}>
        <Outlet />
      </Container>
    </Box>
  );
}

export default MemberLayout;
