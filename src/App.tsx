import { Container, Grid, Stack, Paper } from "@mui/material";

import { useAppSelector } from "./redux/store.ts";
import FileUploadBtn from "./components/FileUploadBtn.tsx";
import CompactList from "./components/CompactList.tsx";
import FileBlock from "./components/FileBlock.tsx";

function App() {
  const fileList = useAppSelector((state) => state.upload.value);

  return (
    <Container maxWidth={false}>
      <Grid container spacing={2} p={3}>
        <Grid item xs={"auto"}>
          <Paper>
            <CompactList />
          </Paper>
        </Grid>
        <Grid item xs>
          <Paper sx={{ width: "100%" }}>
            <Stack p={2} spacing={1}>
              {fileList.map((item, idx) => (
                <FileBlock key={idx} idx={idx} file={item} />
              ))}
              <FileUploadBtn />
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
