import { MouseEvent, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";

import { addFile } from "../redux/slices/uploadSlice.ts";
import { useAppSelector } from "../redux/store.ts";
import { fileType } from "../redux/types.ts";
import Notificator from "./Notificator.tsx";

function AddFileBtn() {
  const dispatch = useDispatch();
  const pw = useAppSelector((state) => state.user.value.password);
  const [openAlarm, setOpenAlarm] = useState(false);

  const onClickBtn = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      const selected = await open({
        directory: false,
        title: "업로드 파일 선택",
      });

      const re = new RegExp(/([\\/])/, "g");
      let uploadFile: fileType | null = null;
      if (selected) {
        if (typeof selected == "string") {
          const dirs = selected.split(re);
          const fileName = dirs[dirs.length - 1];
          uploadFile = { name: fileName, path: selected };
        } else {
          const dirs = selected[0].split(re);
          const fileName = dirs[dirs.length - 1];
          uploadFile = { name: fileName, path: selected[0] };
        }
      }

      if (!uploadFile) return;

      dispatch(addFile(uploadFile));
      invoke("upload_handler", {
        uploadFilePath: uploadFile.path,
      })
        .then((res) => {
          console.log(res);
        })
        .catch(() => setOpenAlarm(true));
    },
    [pw],
  );

  return (
    <>
      <Button onClick={onClickBtn} startIcon={<CloudUpload />}>
        파일 업로드
      </Button>
      <Notificator
        open={openAlarm}
        setOpen={setOpenAlarm}
        message={"서버에 연결할 수 없습니다."}
        severity={"error"}
      />
    </>
  );
}

export default AddFileBtn;
