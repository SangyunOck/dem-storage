import { memo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { IconButton, ListItem, ListItemText } from "@mui/material";
import { Delete, Upload } from "@mui/icons-material";

import { deleteFile } from "../redux/slices/uploadSlice.ts";

interface Props {
  idx: number;
  file: File;
}

function FileListItem({ idx, file }: Props) {
  const dispatch = useDispatch();

  const upload = useCallback(() => {
    //TODO: 파일 업로드 호출
  }, []);

  return (
    <ListItem
      secondaryAction={
        <>
          <IconButton onClick={upload}>
            <Upload />
          </IconButton>
          <IconButton onClick={() => dispatch(deleteFile(idx))}>
            <Delete />
          </IconButton>
        </>
      }
    >
      <ListItemText primary={file.name} />
    </ListItem>
  );
}

export default memo(FileListItem);
