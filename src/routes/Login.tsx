import { useEffect, useState } from "react";
import { Form, Link, redirect, useActionData } from "react-router-dom";
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

export const loginAction = async ({ request }: { request: Request }) => {
  const data = await request.formData();
  return serverFetcher
    .post("/member/login", data)
    .then((res) => {
      console.log(res);
      return redirect("/");
    })
    .catch((err) => {
      console.error(err);
      return err;
    });
};

function Login() {
  const actionData = useActionData();
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (actionData) setIsError(true);
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
