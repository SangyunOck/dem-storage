import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  ButtonBase,
  Divider,
  Stack,
  styled,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Folder,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
  Settings,
} from "@mui/icons-material";

import UserInfoBox from "./UserInfoBox.tsx";

const CustomButtonBase = styled(ButtonBase)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1),
  ":hover": { backgroundColor: theme.palette.divider },
}));

function SideBar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const [isCompact, setIsCompact] = useState<boolean>(isSmall);

  useEffect(() => {
    if (isSmall) setIsCompact(true);
    else setIsCompact(false);
    return () => {};
  }, [isSmall]);

  return (
    <Stack spacing={1}>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <div>
          <CustomButtonBase
            onClick={() => setIsCompact((prevState) => !prevState)}
          >
            {isCompact ? (
              <KeyboardDoubleArrowRight />
            ) : (
              <KeyboardDoubleArrowLeft />
            )}
          </CustomButtonBase>
        </div>
      </Box>
      {!isCompact && <UserInfoBox />}
      <Divider />
      <CustomButtonBase onClick={() => navigate("/")}>
        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "24px 1fr",
          }}
        >
          <Folder />
          {!isCompact && <Typography>내 파일</Typography>}
        </div>
      </CustomButtonBase>
      <CustomButtonBase onClick={() => navigate("/settings")}>
        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "24px 1fr",
          }}
        >
          <Settings />
          {!isCompact && <Typography>설정</Typography>}
        </div>
      </CustomButtonBase>
    </Stack>
  );
}

export default SideBar;
