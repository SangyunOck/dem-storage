import { ChangeEvent, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@mui/material";

import { addFile } from "../redux/slices/uploadSlice.ts";

function AddFileBtn() {
  const dispatch = useDispatch();

  const onChangeFile = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.target.files && e.target.files[0]) {
        dispatch(addFile(e.target.files[0]));
      }
    },
    [dispatch],
  );
  return (
    <Button component={"label"} role={undefined}>
      파일 추가
      <input type={"file"} hidden onChange={onChangeFile} />
    </Button>
  );
}

export default AddFileBtn;
