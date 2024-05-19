import { memo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { IconButton, ListItem, ListItemText } from "@mui/material";
import { Delete, Download } from "@mui/icons-material";

import { deleteFile } from "../redux/slices/uploadSlice.ts";
import { uploadFileSliceType } from "../redux/types.ts";

interface Props {
  myFile: uploadFileSliceType;
}

function FileListItem({ myFile }: Props) {
  const dispatch = useDispatch();

  const download = useCallback(() => {
    //TODO: 파일 업로드 호출
  }, []);

  return (
    <ListItem
      secondaryAction={
        <>
          <IconButton onClick={download}>
            <Download />
          </IconButton>
          <IconButton onClick={() => dispatch(deleteFile(myFile.id))}>
            <Delete />
          </IconButton>
        </>
      }
    >
      <ListItemText primary={myFile.name} />
    </ListItem>
  );
}

export default memo(FileListItem);
