import { useEffect, useState } from "react";
import { Form, Link, useActionData, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  FormHelperText,
  Link as MLink,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { serverFetcher } from "../fetchers.ts";
import { login } from "../redux/slices/userSlice.ts";

type resType = {
  id?: string;
  ok: boolean;
};

export const loginAction = async ({
  request,
}: {
  request: Request;
}): Promise<resType> => {
  const data = await request.formData();
  return serverFetcher
    .post("/member/login", data)
    .then((res): resType => {
      return { id: res.data.id, ok: true };
    })
    .catch((): resType => {
      return { ok: false };
    });
};

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const actionData = useActionData() as resType;
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!!actionData) {
      if (actionData.ok && actionData.id) {
        dispatch(login(actionData.id));
        navigate("/");
      } else setIsError(true);
    }
    return () => {};
  }, [actionData]);

  return (
    <Box sx={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
      <Box sx={{ height: "22vh", minHeight: "120px" }}></Box>
      <Stack component={Form} method={"POST"}>
        <TextField
          type={"text"}
          name={"id"}
          onChange={() => setIsError(false)}
          label={"아이디"}
          margin={"dense"}
        />
        <TextField
          type={"password"}
          name={"password"}
          onChange={() => setIsError(false)}
          label={"비밀번호"}
          margin={"dense"}
        />
        <FormHelperText error={isError} sx={{ height: "19px" }}>
          {isError && "아이디나 비밀번호를 확인해주세요."}
        </FormHelperText>
        <Button type={"submit"}>로그인</Button>
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
