import { ChangeEvent, useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@mui/material";

import { addFile } from "../redux/slices/uploadSlice.ts";
import { CloudUpload } from "@mui/icons-material";
import UploadTest from "../test/UploadTest.tsx";

function AddFileBtn() {
  const dispatch = useDispatch();
  const currentID = useRef<number>(-1);
  const [startInterval, killInterval, killAllIntervals] = UploadTest();

  const onChangeFile = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.target.files && e.target.files[0]) {
        dispatch(addFile(e.target.files[0]));
        currentID.current += 1;
        startInterval(currentID.current, 10, 1000);
      }
    },
    [currentID.current],
  );

  useEffect(() => {
    return () => {
      killAllIntervals();
    };
  }, []);

  return (
    <Button component={"label"} role={undefined} startIcon={<CloudUpload />}>
      파일 업로드
      <input type={"file"} hidden onChange={onChangeFile} />
    </Button>
  );
}

export default AddFileBtn;
