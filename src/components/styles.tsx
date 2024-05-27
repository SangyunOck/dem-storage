import { Box, ButtonBase, styled } from "@mui/material";

export const CustomButtonBase = styled(ButtonBase)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1),
  ":hover": { backgroundColor: theme.palette.divider },
}));

export const ScrollBox = styled("div")(({ theme }) => ({
  overflow: "auto",
  height: "inherit",
  width: "100%",
  "::-webkit-scrollbar": {
    width: "6px",
    height: "6px",
  },
  "::-webkit-scrollbar-track": {
    background: theme.palette.background.paper,
  },
  "::-webkit-scrollbar-thumb": {
    background: theme.palette.text.secondary,
    borderRadius: theme.spacing(1),
    zIndex: 1,
  },
}));

export const ListItemBase = styled(Box)(({ theme }) => ({
  width: "100%",
  borderRadius: theme.spacing(0.5),
  cursor: "default",
  ":hover": { backgroundColor: theme.palette.divider },
}));

export const ListItemFunctionButtonBase = styled(ButtonBase)(({ theme }) => ({
  fontSize: "24px",
  color: theme.palette.grey[500],
  ":hover": {
    color: theme.palette.text.primary,
  },
}));
