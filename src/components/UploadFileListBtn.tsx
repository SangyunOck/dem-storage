import { useCallback, useState, MouseEvent, useMemo } from "react";
import {
  Badge,
  Box,
  CircularProgress,
  List,
  Popover,
  Typography,
  useTheme,
} from "@mui/material";
import { Upload } from "@mui/icons-material";
import { cyan } from "@mui/material/colors";
import _ from "underscore";

import { useAppSelector } from "../redux/store.ts";
import { CustomButtonBase, ScrollBox } from "./styles.tsx";
import UploadFileListItem from "./UploadFileListItem.tsx";

function ButtonIcon() {
  const theme = useTheme();
  const files = useAppSelector((state) => state.upload.value.files);

  const unCompletedFiles = files.filter((f) => !f.isCompleted);
  const unCheckedFiles = files.filter((f) => !f.isChecked);

  return (
    <Box>
      <Badge
        badgeContent={unCheckedFiles.length}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        sx={{
          "& .MuiBadge-badge": {
            backgroundColor: cyan[700],
            zIndex: 10,
            color: theme.palette.text.primary,
          },
        }}
      >
        <Upload />
      </Badge>
      <CircularProgress
        variant={"determinate"}
        value={
          unCompletedFiles.length > 0
            ? unCompletedFiles.reduce((a, f) => a + f.progress, 0) /
              unCompletedFiles.length
            : 0
        }
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      />
    </Box>
  );
}

function UploadFileListBtn() {
  const theme = useTheme();
  const len = useAppSelector((state) => state.upload.value.len);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const onClickAlarm = useCallback((e: MouseEvent<HTMLElement>) => {
    setAnchorEl(() => {
      return e.currentTarget;
    });
  }, []);

  const EmptyAlarms = useMemo(() => {
    return (
      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant={"overline"}>
          업로드 중인 파일이 없습니다.
        </Typography>
      </Box>
    );
  }, []);

  return (
    <>
      <CustomButtonBase
        onClick={onClickAlarm}
        sx={{
          position: "relative",
          borderRadius: "50%",
        }}
      >
        <ButtonIcon />
      </CustomButtonBase>
      <Popover
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box sx={{ width: theme.spacing(50), height: theme.spacing(30) }}>
          <ScrollBox>
            {len == 0 ? (
              EmptyAlarms
            ) : (
              <List disablePadding>
                {_.range(len - 1, -1).map((n) => (
                  <UploadFileListItem key={_.uniqueId(`{n}`)} idx={n} />
                ))}
              </List>
            )}
          </ScrollBox>
        </Box>
      </Popover>
    </>
  );
}

export default UploadFileListBtn;
