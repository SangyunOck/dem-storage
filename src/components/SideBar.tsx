import { useNavigate } from "react-router-dom";
import { Box, Divider, Stack, Typography } from "@mui/material";
import {
  Folder,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
  Settings,
} from "@mui/icons-material";

import UserInfoBox from "./UserInfoBox.tsx";
import { CustomButtonBase } from "./styles.tsx";

interface Props {
  isCompact: boolean;
  toggleIsCompact: () => void;
}

function SideBar(props: Props) {
  const { isCompact, toggleIsCompact } = props;
  const navigate = useNavigate();

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
