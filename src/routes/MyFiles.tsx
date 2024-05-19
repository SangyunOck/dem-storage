import { List } from "@mui/material";

import FileListItem from "../components/FileListItem.tsx";
import { ScrollBox } from "../components/styles.tsx";
import { useAppSelector } from "../redux/store.ts";

function MyFiles() {
  const fileList = useAppSelector((state) => state.upload.value);

  return (
    <ScrollBox>
      <List sx={{ width: "100%" }}>
        {fileList.map((item, idx) => (
          <FileListItem key={idx} myFile={item} />
        ))}
      </List>
    </ScrollBox>
  );
}

export default MyFiles;
