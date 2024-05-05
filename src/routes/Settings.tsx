import { ReactNode } from "react";
import { useDispatch } from "react-redux";
import { Box, Button, Divider, Grid, Stack, Typography } from "@mui/material";

import { logout } from "../redux/slices/userSlice.ts";

function SettingBox({ children, name }: { children: ReactNode; name: string }) {
  return (
    <Box p={2}>
      <Typography variant={"subtitle2"}>{name}</Typography>
      <Box>{children}</Box>
    </Box>
  );
}

function Settings() {
  const dispatch = useDispatch();

  return (
    <Stack divider={<Divider />}>
      <SettingBox name={"내 계정"}>
        <Grid container py={2}>
          <Grid item xs>
            <Box
              sx={{
                display: "flex",
                flexGrow: 1,
                height: "100%",
                alignItems: "center",
              }}
            >
              <Typography variant={"body2"}>
                내 계정에서 로그아웃합니다.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={"auto"}>
            <Button onClick={() => dispatch(logout())}>로그아웃</Button>
          </Grid>
        </Grid>
      </SettingBox>
    </Stack>
  );
}

export default Settings;
