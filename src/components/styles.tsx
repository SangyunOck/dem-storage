import {
  ButtonBase,
  LinearProgress,
  linearProgressClasses,
  ListItemButton,
  styled,
} from "@mui/material";

export const CustomButtonBase = styled(ButtonBase)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  padding: theme.spacing(0),
  ":hover": { backgroundColor: theme.palette.action.hover },
  "> *": {
    padding: theme.spacing(1),
  },
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

export const ListItemBase = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.spacing(0.5),
  cursor: "default",
}));

export const ListItemFunctionButtonBase = styled(ButtonBase)(({ theme }) => ({
  fontSize: "24px",
  color: theme.palette.grey[500],
  ":hover": {
    color: theme.palette.text.primary,
  },
}));

export const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 6,
  borderRadius: 4,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.text,
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 4,
    backgroundColor: theme.palette.primary.dark,
  },
}));
