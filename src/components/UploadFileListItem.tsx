import { memo, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  LinearProgress,
  ListItem,
  ListItemButton,
  Typography,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import dayjs from "dayjs";

import { uploadFileType } from "../redux/slices/uploadSlice.ts";

interface Props {
  uploadFile: uploadFileType;
}

const setTimeStamp = (dateTime: Date) => dayjs(dateTime).locale("ko").fromNow();

function UploadFileListItem(props: Props) {
  const { id, file, startAt, progress, isCompleted } = props.uploadFile;
  const timeStamp = useRef(setTimeStamp(startAt));

  useEffect(() => {
    timeStamp.current = setTimeStamp(startAt);
    return () => {};
  }, []);

  return (
    <ListItem disablePadding>
      <ListItemButton>
        <Grid container spacing={2} py={0.5}>
          <Grid item container xs>
            <Grid item xs={12}>
              <div style={{ width: `270px`, position: "relative" }}>
                <Typography noWrap>{file.name}</Typography>
                {isCompleted && (
                  <div style={{ position: "absolute", top: 0, right: -5 }}>
                    <CheckCircle fontSize={"small"} color={"success"} />
                  </div>
                )}
              </div>
            </Grid>
            {!isCompleted && (
              <Grid item container xs={12}>
                <Box sx={{ flexGrow: 1, display: "flex" }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress variant={"determinate"} value={progress} />
                  </Box>
                  <Typography
                    component={"span"}
                    variant={"subtitle2"}
                    sx={{
                      width: "30px",
                      position: "relative",
                      left: 3,
                      top: -8,
                    }}
                  >
                    {progress}%
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
          <Grid item xs={2}>
            <Typography variant={"overline"}>{timeStamp.current}</Typography>
          </Grid>
        </Grid>
      </ListItemButton>
    </ListItem>
  );
}

export default memo(UploadFileListItem);
