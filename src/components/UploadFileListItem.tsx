import { memo, useCallback, useEffect, useRef } from "react";
import { Box, ListItem, ListItemText, Typography } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import dayjs from "dayjs";

import { uploadFileSliceType } from "../redux/types.ts";
import { ListItemBase } from "./styles.tsx";
import FileFormatIcon from "./FileFormatIcon.tsx";
import FileTransferProgressBar from "./FileTransferProgressBar.tsx";
import { useDispatch } from "react-redux";
import { checkOne } from "../redux/slices/uploadSlice.ts";

interface Props {
  uploadFile: uploadFileSliceType;
}

const setTimeStamp = (dateTime: Date) => dayjs(dateTime).locale("ko").fromNow();

function UploadFileListItem(props: Props) {
  const { id, file, startAt, progress, isCompleted, isChecked } =
    props.uploadFile;
  const dispatch = useDispatch();
  const timeStamp = useRef(setTimeStamp(startAt));

  const check = useCallback(() => dispatch(checkOne(id)), []);

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
              <FileTransferProgressBar value={progress} fontSize={"12px"} />
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
