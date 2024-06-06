import { memo } from "react";
import { Box, List, Typography } from "@mui/material";
import { AnimatePresence } from "framer-motion";

import { ScrollBox } from "./styles.tsx";
import FileListItem from "./FileListItem.tsx";
import { useAppSelector } from "../redux/store.ts";

const EmptyNote = memo(() => {
  return (
    <Box
      sx={{
        flexGrow: 1,
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant={"caption"}>파일이 없습니다.</Typography>
    </Box>
  );
});

function MyFileList() {
  const { files, sortMethod, searchInput } = useAppSelector(
    (state) => state.download.value,
  );

  const downloadFiles = files.filter((f) => f.file.name.includes(searchInput));

  return (
    <ScrollBox sx={{ height: "100%" }}>
      {downloadFiles.length ? (
        <AnimatePresence>
          <List disablePadding dense>
            {[...downloadFiles].sort(sortMethod).map((item, idx) => (
              <FileListItem
                key={`${item.file.name}${item.file.path}`}
                listIdx={idx}
                fileItem={item}
              />
            ))}
          </List>
        </AnimatePresence>
      ) : (
        <EmptyNote />
      )}
    </ScrollBox>
  );
}

export default MyFileList;
