import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import _ from "underscore";
import { invoke } from "@tauri-apps/api/tauri";
import { Box, Stack, useTheme, useMediaQuery } from "@mui/material";

import SideBar from "../components/SideBar.tsx";
import AddFileBtn from "../components/AddFileBtn.tsx";
import UploadFileListBtn from "../components/UploadFileListBtn.tsx";
import { EventListeners } from "../hooks.ts";

export const registerPeer = async () => {
  return await invoke("", {})
    .then((r) => {
      console.log(r);
      return null;
    })
    .catch((e) => {
      console.error(e);
      return null;
    });
};

function MainLayout() {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isCompact, setIsCompact] = useState<boolean>(isSmall);
  const sidebarSize = isCompact ? 56 : 200;
  const [startListeners, terminateListeners] = EventListeners();

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
    startListeners();
    return () => {
      window.removeEventListener("resize", getWindowSize);
      terminateListeners();
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
        <Box sx={{ height: "calc(100% - 50px)" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;
