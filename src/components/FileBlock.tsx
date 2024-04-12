import { memo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Card, IconButton, Typography } from "@mui/material";
import { Delete, Upload } from "@mui/icons-material";

import { deleteFile } from "../redux/slices/uploadSlice.ts";

interface Props {
  idx: number;
  file: File;
}

function FileBlock({ idx, file }: Props) {
  const dispatch = useDispatch();

  const upload = useCallback(() => {
    //TODO: 파일 업로드 호출
  }, []);

  return (
    <Card>
      <Typography variant="body2" color="textSecondary">
        {file.name}
      </Typography>
      <IconButton onClick={upload}>
        <Upload />
      </IconButton>
      <IconButton onClick={() => dispatch(deleteFile(idx))}>
        <Delete />
      </IconButton>
    </Card>
  );
}

export default memo(FileBlock);
