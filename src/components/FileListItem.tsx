import { memo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { IconButton, ListItem, ListItemText } from "@mui/material";
import { Delete, Download } from "@mui/icons-material";
import { Store } from "tauri-plugin-store-api";
import { invoke } from "@tauri-apps/api/tauri";

import { deleteFile } from "../redux/slices/uploadSlice.ts";
import { uploadFileSliceType } from "../redux/types.ts";
import { NodeType } from "./AddFileBtn.tsx";

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

  const handleDownload = useCallback(async () => {
    const val = await store.get<{ results: ScheduledChunkType[] }>(myFile.path);
    console.log(val?.results);
    val &&
      invoke("download", { scheduledChunks: val.results })
        .then((res) => console.log(res))
        .catch((err) => console.error(err));
  }, []);

  const handleDelete = useCallback(() => {
    dispatch(deleteFile(myFile.id));
    store.delete(myFile.path).then((r) => r);
  }, []);

  return (
    <ListItem
      secondaryAction={
        <>
          <IconButton onClick={handleDownload}>
            <Download />
          </IconButton>
          <IconButton onClick={handleDelete}>
            <Delete />
          </IconButton>
        </>
      }
    >
      <ListItemText
        primary={myFile.name}
        primaryTypographyProps={{ variant: "fileTitle" }}
      />
    </ListItem>
  );
}

export default memo(FileListItem);
