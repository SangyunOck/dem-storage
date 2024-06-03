import { Link, useLocation } from "react-router-dom";
import { Box, Divider, Stack, Typography, useTheme } from "@mui/material";
import {
  Folder,
  FolderOutlined,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
  Settings,
  SettingsOutlined,
} from "@mui/icons-material";

import UserInfoBox from "./UserInfoBox.tsx";
import { CustomButtonBase } from "./styles.tsx";

interface Props {
  isCompact: boolean;
  toggleIsCompact: () => void;
}

function SideBar(props: Props) {
  const { isCompact, toggleIsCompact } = props;
  const { pathname } = useLocation();
  const theme = useTheme();

  return (
    <Stack spacing={1} sx={{ width: "100%" }}>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <div>
          <CustomButtonBase onClick={toggleIsCompact}>
            <Box>
              {isCompact ? (
                <KeyboardDoubleArrowRight />
              ) : (
                <KeyboardDoubleArrowLeft />
              )}
            </Box>
          </CustomButtonBase>
        </div>
      </Box>
      {!isCompact && <UserInfoBox />}
      <Divider />
      <CustomButtonBase
        sx={{
          bgcolor: pathname == "/" ? theme.palette.action.selected : undefined,
        }}
      >
        <Link
          to={"/"}
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "24px 1fr",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          {pathname == "/" ? <Folder /> : <FolderOutlined />}
          {!isCompact && <Typography>내 파일</Typography>}
        </Link>
      </CustomButtonBase>
      <CustomButtonBase
        sx={{
          bgcolor:
            pathname == "/settings" ? theme.palette.action.selected : undefined,
        }}
      >
        <Link
          to={"/settings"}
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "24px 1fr",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          {pathname == "/settings" ? <Settings /> : <SettingsOutlined />}
          {!isCompact && <Typography>설정</Typography>}
        </Link>
      </CustomButtonBase>
    </Stack>
  );
}

export default SideBar;
