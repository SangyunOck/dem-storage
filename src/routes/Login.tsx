import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Form, Link, useNavigate, useSearchParams } from "react-router-dom";
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
import AutoLoginSwitch from "../components/AutoLoginSwitch.tsx";
import Notificator from "../components/Notificator.tsx";

const store = new Store(".info.dat");

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const formBtnRef = useRef<HTMLButtonElement | null>(null);
  const [searchParams] = useSearchParams();
  const [openAlarm, setOpenAlarm] = useState(false);
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
          store.set("user", logInput).then();
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
    if (!searchParams.get("retry")) {
      store.get<boolean>("autologin").then((r) => {
        if (!!r) {
          store.get<{ id: string; password: string }>("user").then((val) => {
            if (val) {
              setLogInput({ id: val.id, password: "" });
              serverFetcher
                .post("/member/login", val)
                .then(() => {
                  dispatch(login(val));
                  navigate("/");
                })
                .catch(() => {
                  setOpenAlarm(true);
                });
            }
          });
        }
      });
    }
    return () => {};
  }, []);

  return (
    <>
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
      <Notificator
        open={openAlarm}
        setOpen={setOpenAlarm}
        message={"자동 로그인에 실패했습니다."}
        severity={"error"}
      />
    </>
  );
}

export default Login;
