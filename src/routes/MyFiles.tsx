import { List, ListItem } from "@mui/material";

import FileListItem from "../components/FileListItem.tsx";
import AddFileBtn from "../components/AddFileBtn.tsx";
import { useAppSelector } from "../redux/store.ts";

function MyFiles() {
  const fileList = useAppSelector((state) => state.upload.value);

  return (
    <List>
      {fileList.map((item, idx) => (
        <FileListItem key={idx} idx={idx} file={item} />
      ))}
      <ListItem>
        <AddFileBtn />
      </ListItem>
    </List>
  );
}

export default MyFiles;
