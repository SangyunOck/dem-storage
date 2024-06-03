import { Box, Paper } from "@mui/material";

import ListOptionsBox from "../components/ListOptionsBox.tsx";
import MyFileList from "../components/MyFileList.tsx";

function MyFiles() {
  return (
    <Box sx={{ height: "100%" }}>
      <Box py={0.5}>
        <ListOptionsBox />
      </Box>
      <Paper sx={{ height: "calc(100% - 40px)" }}>
        <MyFileList />
      </Paper>
    </Box>
  );
}

export default MyFiles;
