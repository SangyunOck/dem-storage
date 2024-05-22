import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Form, Link, useNavigate } from "react-router-dom";
import { Store } from "tauri-plugin-store-api";
import {
  Box,
  Button,
  FormControlLabel,
  FormHelperText,
  Link as MLink,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { serverFetcher } from "../fetchers.ts";
import { useDispatch } from "react-redux";
import { login } from "../redux/slices/userSlice.ts";
import { AutoLoginSwitch } from "../components/AutoLoginSwitch.tsx";

const store = new Store(".info.dat");

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const formBtnRef = useRef<HTMLButtonElement | null>(null);
  const isAutoLogin = useRef<boolean>(false);
  const [isError, setIsError] = useState(false);
  const [logInput, setLogInput] = useState<{ id: string; password: string }>({
    id: "",
    password: "",
  });

  const handleId = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setLogInput((prevState) => ({
        id: e.target.value,
        password: prevState.password,
      }));
      if (isError) setIsError(false);
    },
    [isError],
  );

  const handlePw = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setLogInput((prevState) => ({
        id: prevState.id,
        password: e.target.value,
      }));
      if (isError) setIsError(false);
    },
    [isError],
  );

  const submitLogin = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      serverFetcher
        .post("/member/login", logInput)
        .then(() => {
          dispatch(login(logInput));
          navigate("/");
        })
        .catch(() => {
          setIsError(true);
        });
    },
    [logInput],
  );

  useEffect(() => {
    store.get<boolean>("autologin").then((r) => {
      if (!!r) {
        store.get<{ id: string; password: string }>("user").then((val) => {
          val && setLogInput(val);
        });
        isAutoLogin.current = r;
      }
    });
    return () => {};
  }, []);

  useEffect(() => {
    if (isAutoLogin.current) submitLogin();
  }, [isAutoLogin.current]);

  return (
    <Box sx={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
      <Box sx={{ height: "22vh", minHeight: "120px" }}></Box>
      <Stack component={Form} method={"POST"} onSubmit={submitLogin}>
        <TextField
          type={"text"}
          name={"id"}
          value={logInput.id}
          onChange={handleId}
          label={"아이디"}
          margin={"dense"}
        />
        <TextField
          type={"password"}
          name={"password"}
          value={logInput.password}
          onChange={handlePw}
          label={"비밀번호"}
          margin={"dense"}
        />
        <Box>
          <FormControlLabel
            control={<AutoLoginSwitch />}
            label={"자동 로그인"}
          />
        </Box>
        <FormHelperText error={isError} sx={{ height: "19px" }}>
          {isError && "아이디나 비밀번호를 확인해주세요."}
        </FormHelperText>
        <Button type={"submit"} ref={formBtnRef}>
          로그인
        </Button>
        <Box>
          <MLink component={Link} to={"/member/signup"}>
            <Typography variant={"caption"}>회원가입 하러가기</Typography>
          </MLink>
        </Box>
      </Stack>
    </Box>
  );
}

export default Login;
