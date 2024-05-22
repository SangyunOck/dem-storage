import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import _ from "underscore";
import { Paper, Box, Stack, useTheme, useMediaQuery } from "@mui/material";

import SideBar from "../components/SideBar.tsx";
import AddFileBtn from "../components/AddFileBtn.tsx";
import UploadFileListBtn from "../components/UploadFileListBtn.tsx";

function MainLayout() {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isCompact, setIsCompact] = useState<boolean>(isSmall);
  const sidebarSize = isCompact ? 56 : 200;

  const toggleCompact = useCallback(() => setIsCompact((prev) => !prev), []);

  useEffect(() => {
    if (isSmall) setIsCompact(true);
    else setIsCompact(false);
    return () => {};
  }, [isSmall]);

  useEffect(() => {
    const getWindowSize = _.debounce(
      () => setWindowWidth(window.innerWidth),
      30,
    );
    window.addEventListener("resize", getWindowSize);

    return () => {
      window.removeEventListener("resize", getWindowSize);
    };
  }, []);

  return (
    <Box sx={{ flexGrow: 1, display: "flex", height: "100vh" }}>
      <Box sx={{ width: `${sidebarSize}px` }} p={1}>
        <SideBar isCompact={isCompact} toggleIsCompact={toggleCompact} />
      </Box>
      <Box
        sx={{
          flexDirection: "column",
          width: `${windowWidth - sidebarSize}px`,
        }}
        p={1}
      >
        <Stack spacing={1} pb={1} direction={"row-reverse"}>
          <UploadFileListBtn />
          <AddFileBtn />
        </Stack>
        <Paper sx={{ height: "calc(100% - 50px)" }}>
          <Outlet />
        </Paper>
      </Box>
    </Box>
  );
}

export default MainLayout;
