import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { ListItemText, Stack, Typography } from "@mui/material";
import { CheckCircle, Delete, Download } from "@mui/icons-material";
import { Store } from "tauri-plugin-store-api";
import { invoke } from "@tauri-apps/api/tauri";

import { deleteFile } from "../redux/slices/downloadSlice.ts";
import { downloadFileSliceType } from "../redux/types.ts";
import { NodeType } from "./AddFileBtn.tsx";
import { ListItemBase, ListItemFunctionButtonBase } from "./styles.tsx";
import FileFormatIcon from "./FileFormatIcon.tsx";
import FileTransferProgressBar from "./FileTransferProgressBar.tsx";
import { useAppSelector } from "../redux/store.ts";

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
  fileItem: downloadFileSliceType;
}

const store = new Store(".scheduled_nodes.dat");

function FileListItem({ fileItem }: Props) {
  const { file, progress, isInProgress, isCompleted } = fileItem;
  const dispatch = useDispatch();
  const searchInput = useAppSelector(
    (state) => state.listOptions.value.searchInput,
  );

  const handleDownload = useCallback(() => {
    invoke("download_handler", {
      downloadFilePath: file.path,
      downloadFileName: file.name,
    })
      .then((res) => console.log(res))
      .catch((err) => console.error(err));
    // store.get<{ results: ScheduledChunkType[] }>(myFile.path).then((val) => {
    //   val &&
    //     invoke("download_handler", { downloadFilePath: val.results })
    //       .then((res) => console.log(res))
    //       .catch((err) => console.error(err));
    // });
  }, []);

  const handleDelete = useCallback(() => {
    dispatch(deleteFile(file));
    // store.delete(fileItem.path).then((r) => r);
  }, []);

  const highlightedName = useMemo(() => {
    if (searchInput == "") return file.name;
    const fileName = file.name.toLowerCase();
    const idx = fileName.indexOf(searchInput.toLowerCase());
    return idx < 0 ? (
      file.name
    ) : (
      <>
        <Typography
          component={"span"}
          fontSize={"inherit"}
          sx={{ bgcolor: "primary.dark" }}
        >
          {file.name.substring(idx, idx + searchInput.length)}
        </Typography>
        {file.name.substring(idx + searchInput.length, file.name.length)}
      </>
    );
  }, [searchInput]);

  return (
    <ListItemBase disableGutters sx={{ minHeight: "62px" }}>
      <FileFormatIcon fileName={file.name} />
      <ListItemText
        disableTypography
        primary={
          <div style={{ display: "flex", alignItems: "center" }}>
            <Typography variant={"fileTitle"}>{highlightedName}</Typography>
            {isCompleted && (
              <CheckCircle
                sx={{ ml: 0.5 }}
                fontSize={"inherit"}
                color={"success"}
              />
            )}
          </div>
        }
        secondary={isInProgress && <FileTransferProgressBar value={progress} />}
      />
      <Stack
        sx={{ height: "100%" }}
        direction={"row"}
        spacing={1.5}
        py={1}
        px={2}
      >
        <ListItemFunctionButtonBase onClick={handleDownload}>
          <Download fontSize={"inherit"} />
        </ListItemFunctionButtonBase>
        <ListItemFunctionButtonBase onClick={handleDelete}>
          <Delete fontSize={"inherit"} />
        </ListItemFunctionButtonBase>
      </Stack>
    </ListItemBase>
  );
}

export default FileListItem;
