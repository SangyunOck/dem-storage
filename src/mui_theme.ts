import { createTheme } from "@mui/material";

export const mui_theme = createTheme({
  components: {
    MuiButton: {
      defaultProps: {
        variant: "contained",
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
        elevation: 0,
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
  palette: {
    mode: "dark",
  },
});
