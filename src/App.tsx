import { Grid, Paper, Box, List, ListItem } from "@mui/material";

import { useAppSelector } from "./redux/store.ts";
import SideBar from "./components/SideBar.tsx";
import FileListItem from "./components/FileListItem.tsx";
import AddFileBtn from "./components/AddFileBtn.tsx";

function App() {
  const fileList = useAppSelector((state) => state.upload.value);

  return (
    <Box sx={{ flexGrow: 1, height: "100vh" }}>
      <Grid
        container
        p={2}
        spacing={2}
        flexWrap={"nowrap"}
        sx={{ height: "inherit" }}
      >
        <Grid item xs={"auto"}>
          <SideBar />
        </Grid>
        <Grid item xs>
          <Paper sx={{ height: "100%" }}>
            <List>
              {fileList.map((item, idx) => (
                <FileListItem key={idx} idx={idx} file={item} />
              ))}
              <ListItem>
                <AddFileBtn />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default App;
