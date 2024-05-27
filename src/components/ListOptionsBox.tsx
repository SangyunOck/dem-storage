import { useDispatch } from "react-redux";
import _ from "underscore";
import { Chip, Grid, Stack } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

import { useAppSelector } from "../redux/store.ts";
import { changeSortType } from "../redux/slices/fileListOptionSlice.ts";
import { ScrollBox } from "./styles.tsx";

function ListOptionsBox() {
  const dispatch = useDispatch();
  const sortTypes = useAppSelector(
    (state) => state.listOptions.value.sortTypes,
  );

  return (
    <Grid container>
      <Grid item xs={9}>
        <ScrollBox>
          <Stack direction={"row"} spacing={1}>
            {_.map(sortTypes, (v) => {
              return (
                <Chip
                  key={_.uniqueId(v.name)}
                  icon={v.asc ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
                  onClick={() => dispatch(changeSortType(v.name))}
                  label={v.name}
                  color={v.isActive ? "primary" : undefined}
                />
              );
            })}
          </Stack>
        </ScrollBox>
      </Grid>
    </Grid>
  );
}

export default ListOptionsBox;
