import { CSSProperties } from "react";
import { createTheme } from "@mui/material";

declare module "@mui/material/styles" {
  interface TypographyVariants {
    fileTitle: CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    fileTitle?: CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    fileTitle: true;
  }
}

export const mui_theme = createTheme({
  components: {
    MuiButton: {
      defaultProps: {
        variant: "contained",
      },
    },
    MuiChip: {
      defaultProps: {
        clickable: true,
      },
    },
    MuiList: {
      defaultProps: {
        disablePadding: true,
        dense: true,
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
    MuiTypography: {
      defaultProps: {
        noWrap: true,
        variantMapping: {
          fileTitle: "h6",
        },
      },
    },
  },
  palette: {
    mode: "dark",
  },
  typography: {
    fileTitle: {
      fontWeight: 600,
      fontSize: "14.5px",
      textAlign: "left",
    },
  },
});
