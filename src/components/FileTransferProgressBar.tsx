import { Box, LinearProgressProps, Typography } from "@mui/material";

import { BorderLinearProgress } from "./styles.tsx";

interface Props extends LinearProgressProps {
  fontSize?: string;
}

function FileTransferProgressBar(props: Props) {
  const { value, fontSize = "13px" } = props;
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <BorderLinearProgress variant={"determinate"} {...props} />
      </Box>
      <Box>
        <Typography
          variant={"body2"}
          color={"text.secondary"}
          sx={{ fontSize: fontSize }}
        >{`${Math.round(value ?? 0)}%`}</Typography>
      </Box>
    </Box>
  );
}

export default FileTransferProgressBar;
