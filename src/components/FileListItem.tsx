import { memo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Box, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import { Delete, Download } from "@mui/icons-material";
import dayjs from "dayjs";
import { Store } from "tauri-plugin-store-api";
import { invoke } from "@tauri-apps/api/tauri";

import { deleteFile } from "../redux/slices/uploadSlice.ts";
import { uploadFileSliceType } from "../redux/types.ts";
import { NodeType } from "./AddFileBtn.tsx";
import { ListItemBase, ListItemFunctionButtonBase } from "./styles.tsx";

type ChunkType = {
  file_path: string;
  chunk_size: number;
  offset: number;
  index: number;
  total_size: number;
};

type ScheduledChunkType = {
  node: NodeType;
  chunk: ChunkType;
};

interface Props {
  myFile: uploadFileSliceType;
}

const store = new Store(".scheduled_nodes.dat");

function FileListItem({ myFile }: Props) {
  const dispatch = useDispatch();

  const handleDownload = useCallback(() => {
    store.get<{ results: ScheduledChunkType[] }>(myFile.path).then((val) => {
      val &&
        invoke("download", { scheduledChunks: val.results })
          .then((res) => console.log(res))
          .catch((err) => console.error(err));
    });
  }, []);

  const handleDelete = useCallback(() => {
    dispatch(deleteFile(myFile.id));
    store.delete(myFile.path).then((r) => r);
  }, []);

  return (
    <Box>
      <ListItemBase>
        <Grid container sx={{ height: "62px" }} p={2} columnSpacing={2}>
          <Grid item container zeroMinWidth xs>
            <Grid item zeroMinWidth xs>
              <Typography variant={"fileTitle"}>{myFile.name}</Typography>
            </Grid>
            <Grid item xs={"auto"}>
              <Typography variant={"caption"}>
                {dayjs(myFile.startAt).fromNow()}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <LinearProgress variant={"determinate"} value={myFile.progress} />
            </Grid>
          </Grid>
          <Grid item xs={"auto"}>
            <Stack sx={{ height: "100%" }} direction={"row"} spacing={1.5}>
              <ListItemFunctionButtonBase onClick={handleDownload}>
                <Download fontSize={"inherit"} />
              </ListItemFunctionButtonBase>
              <ListItemFunctionButtonBase onClick={handleDelete}>
                <Delete fontSize={"inherit"} />
              </ListItemFunctionButtonBase>
            </Stack>
          </Grid>
        </Grid>
      </ListItemBase>
    </Box>
  );
}

export default memo(FileListItem);
