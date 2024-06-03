import { ReactNode, useMemo } from "react";
import _ from "underscore";
import { Box, List, ListItem, Typography, useTheme } from "@mui/material";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";

import { ScrollBox } from "./styles.tsx";
import FileListItem from "./FileListItem.tsx";
import { useAppSelector } from "../redux/store.ts";

function MyFileList() {
  const downloadFiles = useAppSelector((state) => state.download.value);
  const { sortTypes, searchInput } = useAppSelector(
    (state) => state.listOptions.value,
  );
  const sortType = sortTypes.find((v) => v.isActive);

  const EmptyFile = useMemo(
    () => (
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
    ),
    [],
  );

  const files = useMemo(() => {
    return downloadFiles.filter((f) => f.file.name.includes(searchInput));
  }, [downloadFiles, searchInput]);

  return (
    <ScrollBox sx={{ height: "100%" }}>
      {files.length ? (
        <AnimatePresence>
          <List disablePadding dense>
            {files
              .sort((a, b) => {
                if (sortType?.name == "진행순") {
                  return sortType.asc
                    ? a.progress - b.progress
                    : b.progress - a.progress;
                }
                if (sortType?.name == "파일명순") {
                  return sortType.asc
                    ? a.file.name.localeCompare(b.file.name)
                    : b.file.name.localeCompare(a.file.name);
                }
                return 1;
              })
              .map((item, idx) => (
                <Item idx={idx}>
                  <FileListItem key={_.uniqueId(`${idx}`)} fileItem={item} />
                </Item>
              ))}
          </List>
        </AnimatePresence>
      ) : (
        EmptyFile
      )}
    </ScrollBox>
  );
}

const Item = ({ children, idx }: { children: ReactNode; idx: number }) => {
  const isPresent = useIsPresent();
  const theme = useTheme();

  const animations = {
    sx: {
      position: isPresent ? "static" : "absolute",
      backgroundColor:
        idx % 2 == 1 ? theme.palette.background.default : "inherit",
    },
    initial: { scaleY: 0, opacity: 0 },
    animate: { scaleY: 1, opacity: 1 },
    exit: { scaleY: 0, opacity: 0 },
    transition: { type: "spring", stiffness: 700, damping: 40 },
  };

  return (
    <ListItem component={motion.li} {...animations} layout disablePadding>
      {children}
    </ListItem>
  );
};

export default MyFileList;
