import { ChangeEvent, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import _ from "underscore";
import { Chip, Grid, InputAdornment, Stack, TextField } from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Search,
} from "@mui/icons-material";

import { useAppSelector } from "../redux/store.ts";
import { changeInput, changeSortType } from "../redux/slices/downloadSlice.ts";
import { ScrollBox } from "./styles.tsx";

function SearchInput() {
  const dispatch = useDispatch();
  const [input, setInput] = useState("");

  const debouncedChangeSearchInput = _.debounce((s: string) => {
    dispatch(changeInput(s));
  }, 500);

  const onChangeInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    debouncedChangeSearchInput(e.target.value);
  }, []);

  return (
    <TextField
      fullWidth
      variant={"standard"}
      InputProps={{
        startAdornment: (
          <InputAdornment position={"start"}>
            <Search />
          </InputAdornment>
        ),
      }}
      value={input}
      onChange={onChangeInput}
    />
  );
}

function ListOptionsBox() {
  const dispatch = useDispatch();
  const sortTypes = useAppSelector((state) => state.download.value.sortTypes);

  return (
    <Grid container>
      <Grid item xs={9}>
        <ScrollBox>
          <Stack direction={"row"} spacing={1}>
            {_.map(sortTypes, (v) => {
              return (
                <Chip
                  key={_.uniqueId(v.name)}
                  icon={v.asc ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  onClick={() => dispatch(changeSortType(v.name))}
                  label={v.name}
                  color={v.isActive ? "primary" : undefined}
                />
              );
            })}
          </Stack>
        </ScrollBox>
      </Grid>
      <Grid item xs={3}>
        <SearchInput />
      </Grid>
    </Grid>
  );
}

export default ListOptionsBox;
