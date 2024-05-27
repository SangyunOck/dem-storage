import { useMemo } from "react";
import _ from "underscore";
import { Box, Paper, Stack, Typography } from "@mui/material";

import FileListItem from "../components/FileListItem.tsx";
import ListOptionsBox from "../components/ListOptionsBox.tsx";
import { ScrollBox } from "../components/styles.tsx";
import { useAppSelector } from "../redux/store.ts";

function MyFiles() {
  const fileList = useAppSelector((state) => state.upload.value);
  const { sortTypes } = useAppSelector((state) => state.listOptions.value);

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

  return (
    <Box sx={{ height: "100%" }}>
      <Box py={0.5}>
        <ListOptionsBox />
      </Box>
      <Paper sx={{ height: "calc(100% - 40px)" }}>
        <ScrollBox sx={{ height: "100%" }}>
          {fileList.length >= 1 ? (
            <Stack>
              {[...fileList]
                .sort((a, b) => {
                  if (sortType?.name == "최신순") {
                    return sortType.asc
                      ? a.startAt.getTime() - b.startAt.getTime()
                      : b.startAt.getTime() - a.startAt.getTime();
                  }
                  if (sortType?.name == "파일명순") {
                    return sortType.asc
                      ? a.name.localeCompare(b.name)
                      : b.name.localeCompare(a.name);
                  }
                  return 1;
                })
                .map((item, idx) => (
                  <FileListItem key={_.uniqueId(`${idx}`)} myFile={item} />
                ))}
            </Stack>
          ) : (
            EmptyFile
          )}
        </ScrollBox>
      </Paper>
    </Box>
  );
}

export default MyFiles;
