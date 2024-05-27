import { Dispatch, SetStateAction, SyntheticEvent } from "react";
import { Alert, Snackbar } from "@mui/material";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  message: string;
  severity: "success" | "info" | "warning" | "error";
}

function Notificator(props: Props) {
  const { message, severity, open, setOpen } = props;

  const handleClose = (_?: SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
      <Alert
        onClose={handleClose}
        severity={severity}
        variant={"filled"}
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

export default Notificator;
