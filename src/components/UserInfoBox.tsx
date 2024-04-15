import { useMemo } from "react";
import { Box, Grid, LinearProgress, Typography } from "@mui/material";

function UserInfoBox() {
  const maxValue: number = 50;
  const currentValue: number = 0.5;

  const percentageValue = useMemo(() => {
    return Math.floor((currentValue / maxValue) * 100);
  }, [maxValue, currentValue]);

  return (
    <Box>
      <Grid container py={1} spacing={2}>
        <Grid item xs={12}>
          <Typography>user123</Typography>
        </Grid>
        <Grid item xs={12}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant={"caption"}>저장용량</Typography>
            <Typography variant={"caption"}>
              {currentValue}GB/{maxValue}GB
            </Typography>
          </div>
          <LinearProgress variant={"determinate"} value={percentageValue} />
        </Grid>
      </Grid>
    </Box>
  );
}

export default UserInfoBox;
