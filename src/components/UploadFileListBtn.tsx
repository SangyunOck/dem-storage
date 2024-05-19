import { useCallback, useState, MouseEvent } from "react";
import {
  Box,
  CircularProgress,
  List,
  Popover,
  Typography,
  useTheme,
} from "@mui/material";
import { Upload } from "@mui/icons-material";
import _ from "underscore";

import { useAppSelector } from "../redux/store.ts";
import { CustomButtonBase, ScrollBox } from "./styles.tsx";
import UploadFileListItem from "./UploadFileListItem.tsx";

function EmptyAlarms() {
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
      <Typography variant={"overline"}>업로드 중인 파일이 없습니다.</Typography>
    </Box>
  );
}

function UploadFileListBtn() {
  const theme = useTheme();
  const files = useAppSelector((state) => state.upload.value);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const unCompletedFiles = files.filter((f) => !f.isCompleted);

  const onClickAlarm = useCallback((e: MouseEvent<HTMLElement>) => {
    setAnchorEl(() => {
      return e.currentTarget;
    });
  }, []);

  return (
    <>
      <CustomButtonBase
        onClick={onClickAlarm}
        sx={{ position: "relative", borderRadius: "50%" }}
      >
        <Upload />
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
            {files.length == 0 ? (
              <EmptyAlarms />
            ) : (
              <List disablePadding>
                {files.map((f) => (
                  <UploadFileListItem key={_.uniqueId(f.name)} uploadFile={f} />
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
