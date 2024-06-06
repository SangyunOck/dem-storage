import { Badge, Box, ListItemIcon, Typography } from "@mui/material";
import { InsertDriveFile } from "@mui/icons-material";

const getRGB = (fileFormat?: string) => {
  if (!fileFormat) {
    return undefined;
  }
  const nums = fileFormat
    .split("")
    .map((v) => ((v.charCodeAt(0) * 10) % 156) + 100);
  return `rgb(${nums.length >= 4 ? nums[0] + nums[3] : nums[0]}, ${nums[1]}, ${nums[2]})`;
};

interface Props {
  fileName: string;
  size?: number;
  isChecked?: boolean;
}
function FileFormatIcon(props: Props) {
  const { fileName, size = 32, isChecked = true } = props;
  const format = fileName.split(".").pop();

  return (
    <ListItemIcon
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          fontSize: `${size}px`,
          width: `${size}px`,
          height: `${size + 2}px`,
        }}
      >
        <Badge
          invisible={isChecked}
          overlap={"circular"}
          variant={"dot"}
          anchorOrigin={{ horizontal: "left", vertical: "top" }}
          color={"info"}
        >
          <div style={{ position: "relative" }}>
            <InsertDriveFile fontSize={"inherit"} />
            <div
              style={{
                position: "absolute",
                top: size - 9,
                left: size / 2 - (size * 2) / 6,
                width: `${(size * 2) / 3}px`,
                height: "4px",
                backgroundColor: getRGB(format),
              }}
            ></div>
          </div>
        </Badge>
      </Box>
      <Typography
        variant={"overline"}
        sx={{
          lineHeight: "initial",
          fontSize: `${Math.ceil(size / 3 + 1)}px`,
        }}
      >
        {format}
      </Typography>
    </ListItemIcon>
  );
}
export default FileFormatIcon;
