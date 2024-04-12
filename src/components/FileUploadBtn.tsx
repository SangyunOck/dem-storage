import { ChangeEvent, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@mui/material";

import { addFile } from "../redux/slices/uploadSlice.ts";

function FileUploadBtn() {
  const dispatch = useDispatch();

  const onChangeFile = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        dispatch(addFile(e.target.files[0]));
      }
    },
    [dispatch],
  );
  return (
    <Button component={"label"} role={undefined}>
      파일 추가
      <input type={"file"} hidden={true} onChange={onChangeFile} />
    </Button>
  );
}

export default FileUploadBtn;
