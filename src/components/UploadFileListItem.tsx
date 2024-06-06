import { memo, useCallback, useEffect, useRef } from "react";
import { Box, ListItem, ListItemText, Typography } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import dayjs from "dayjs";

import { ListItemBase } from "./styles.tsx";
import FileFormatIcon from "./FileFormatIcon.tsx";
import FileTransferProgressBar from "./FileTransferProgressBar.tsx";
import { useDispatch } from "react-redux";
import { checkOne } from "../redux/slices/uploadSlice.ts";
import { useAppSelector } from "../redux/store.ts";

interface Props {
  idx: number;
}

const setTimeStamp = (dateTime: Date) => dayjs(dateTime).locale("ko").fromNow();

function UploadFileListItem(props: Props) {
  const dispatch = useDispatch();
  const { idx } = props;
  const { file, progress, startAt, isChecked, isCompleted } = useAppSelector(
    (state) => state.upload.value.files[idx],
  );
  const timeStamp = useRef(setTimeStamp(startAt));

  const check = useCallback(() => dispatch(checkOne(idx)), []);

  useEffect(() => {
    timeStamp.current = setTimeStamp(startAt);
    return () => {};
  }, []);

  return (
    <ListItem disablePadding onMouseEnter={check}>
      <ListItemBase disableGutters>
        <FileFormatIcon fileName={file.name} isChecked={isChecked} size={24} />
        <ListItemText
          disableTypography
          primary={
            <div style={{ display: "flex", alignItems: "center" }}>
              <Typography variant={"fileTitle"} fontSize={"14px"}>
                {file.name}
              </Typography>
              {isCompleted && (
                <CheckCircle
                  sx={{ ml: 0.5, fontSize: "inherit" }}
                  color={"success"}
                />
              )}
            </div>
          }
          secondary={
            !isCompleted && (
              <FileTransferProgressBar
                value={progress}
                fontSize={"12px"}
                sx={{ height: 4 }}
              />
            )
          }
        />
        <Box px={2}>
          <Typography variant={"button"} fontSize={"10px"}>
            {timeStamp.current}
          </Typography>
        </Box>
      </ListItemBase>
    </ListItem>
  );
}

export default memo(UploadFileListItem);
