import { memo, useEffect, useRef } from "react";
import { Box, Grid, LinearProgress, ListItem, Typography } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import dayjs from "dayjs";

import { uploadFileSliceType } from "../redux/types.ts";
import { ListItemBase } from "./styles.tsx";

interface Props {
  uploadFile: uploadFileSliceType;
}

const setTimeStamp = (dateTime: Date) => dayjs(dateTime).locale("ko").fromNow();

function UploadFileListItem(props: Props) {
  const { name, startAt, progress, isCompleted } = props.uploadFile;
  const timeStamp = useRef(setTimeStamp(startAt));

  useEffect(() => {
    timeStamp.current = setTimeStamp(startAt);
    return () => {};
  }, []);

  return (
    <ListItem disablePadding>
      <ListItemBase>
        <Grid container spacing={1} p={2} pr={1}>
          <Grid item container xs spacing={1}>
            <Grid item xs={12}>
              <div style={{ width: `270px`, position: "relative" }}>
                <Typography variant={"fileTitle"}>{name}</Typography>
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
      </ListItemBase>
    </ListItem>
  );
}

export default memo(UploadFileListItem);
