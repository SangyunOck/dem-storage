import { useCallback, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import {
  ListItem,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { CheckCircle, Delete, Download } from "@mui/icons-material";
import { motion, useIsPresent } from "framer-motion";
import { Store } from "tauri-plugin-store-api";
import { invoke } from "@tauri-apps/api/tauri";

import { deleteFile, setProgress } from "../redux/slices/downloadSlice.ts";
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
  listIdx: number;
  fileItem: downloadFileSliceType;
}

const store = new Store(".scheduled_nodes.dat");

function FileNameTypo({ name }: { name: string }) {
  const searchInput = useAppSelector(
    (state) => state.download.value.searchInput,
  );

  const highlightedName = useMemo(() => {
    if (searchInput == "") return name;
    const fileName = name.toLowerCase();
    const idx = fileName.indexOf(searchInput.toLowerCase());
    return idx < 0 ? (
      name
    ) : (
      <>
        <Typography
          component={"span"}
          fontSize={"inherit"}
          sx={{ bgcolor: "primary.dark" }}
        >
          {name.substring(idx, idx + searchInput.length)}
        </Typography>
        {name.substring(idx + searchInput.length, name.length)}
      </>
    );
  }, [searchInput]);

  return <Typography variant={"fileTitle"}>{highlightedName}</Typography>;
}

function FileListItem({ fileItem, listIdx }: Props) {
  const { file, progress, isInProgress, isCompleted } = fileItem;
  const dispatch = useDispatch();
  const isPresent = useIsPresent();
  const theme = useTheme();

  const animations = {
    sx: {
      position: isPresent ? "static" : "absolute",
      backgroundColor:
        listIdx % 2 == 1 ? theme.palette.background.default : "inherit",
    },
    initial: { scaleY: 0, opacity: 0 },
    animate: { scaleY: 1, opacity: 1 },
    exit: { scaleY: 0, opacity: 0 },
    transition: { type: "spring", stiffness: 700, damping: 40 },
  };

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

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(setProgress({ file: file, progress: progress + 10 }));
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <ListItem component={motion.li} {...animations} layout disablePadding>
      <ListItemBase disableGutters sx={{ minHeight: "62px" }}>
        <FileFormatIcon fileName={file.name} />
        <ListItemText
          disableTypography
          primary={
            <div style={{ display: "flex", alignItems: "center" }}>
              <FileNameTypo name={file.name} />
              {isCompleted && (
                <CheckCircle
                  sx={{ ml: 0.5 }}
                  fontSize={"inherit"}
                  color={"success"}
                />
              )}
            </div>
          }
          secondary={
            isInProgress && <FileTransferProgressBar value={progress} />
          }
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
    </ListItem>
  );
}

export default FileListItem;
