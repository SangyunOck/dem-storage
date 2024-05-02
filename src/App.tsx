import { Grid, Paper, Box, List, ListItem, Link as MLink } from "@mui/material";
import { Link } from "react-router-dom";

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
              <ListItem>
                <MLink component={Link} to={"/member/login"}>
                  로그인
                </MLink>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default App;
