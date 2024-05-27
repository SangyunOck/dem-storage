import { useCallback, useEffect, useState } from "react";
import { Switch } from "@mui/material";
import { Store } from "tauri-plugin-store-api";

const store = new Store(".info.dat");

function AutoLoginSwitch() {
  const [autoLogin, setAutoLogin] = useState(false);

  const handleSwitch = useCallback(
    () =>
      setAutoLogin((prevState) => {
        if (prevState) {
          store.delete("autologin").then((r) => r);
        } else {
          store.set("autologin", true).then((r) => r);
        }
        return !prevState;
      }),
    [],
  );

  useEffect(() => {
    store
      .get<boolean>("autologin")
      .then((r) => setAutoLogin(!!r))
      .catch(() => setAutoLogin(false));
    return () => {};
  }, []);

  return <Switch checked={autoLogin} onClick={handleSwitch} />;
}

export default AutoLoginSwitch;
