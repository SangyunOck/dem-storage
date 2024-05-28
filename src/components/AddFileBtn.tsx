import { MouseEvent, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { Store } from "tauri-plugin-store-api";
import _ from "underscore";

import { addFile } from "../redux/slices/uploadSlice.ts";
import { serverFetcher } from "../fetchers.ts";
import { useAppSelector } from "../redux/store.ts";
import { uploadFileType } from "../redux/types.ts";
import Notificator from "./Notificator.tsx";

export type NodeType = {
  peer_id: string;
  endpoint: string;
};

const store = new Store(".scheduled_nodes.dat");

function AddFileBtn() {
  const dispatch = useDispatch();
  const pw = useAppSelector((state) => state.user.value.password);
  const [openAlarm, setOpenAlarm] = useState(false);

  const onClickBtn = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      const nodes = await serverFetcher
        .get("/node/available-nodes")
        .then((res) => {
          return _.map(
            res.data.nodes,
            (v): NodeType => ({ peer_id: v.peerId, endpoint: v.ipAddress }),
          );
        })
        .catch((err) => {
          console.error(err);
          return null;
        });

      if (!nodes) {
        setOpenAlarm(true);
        return;
      }

      const selected = await open({
        directory: false,
        title: "업로드 파일 선택",
      });

      const re = new RegExp(/([\\/])/, "g");
      let uploadFile: uploadFileType | null = null;
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
      invoke("upload_handler")
        .then(async (res) => {
          await store.set(uploadFile?.path, { results: res });
          await store.save();
        })
        .catch((err) => console.error(err));
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
