import { useEffect, useState } from "react";
import { Form, redirect, useActionData, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  FormHelperText,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import { ArrowBack, CheckCircleOutline } from "@mui/icons-material";

import { serverFetcher } from "../fetchers.ts";

export const signupAction = async ({ request }: { request: Request }) => {
  const data = await request.formData();
  data.delete("re-password");
  return serverFetcher
    .post("/member", data)
    .then(() => redirect(`/member/new?id=${data.get("id")}`))
    .catch((err) => {
      console.error(err);
      return err;
    });
};

function Signup() {
  const navigate = useNavigate();
  const actionData = useActionData();
  const [id, setId] = useState<String>("");
  const [password, setPassword] = useState<String>("");
  const [repassword, setRepassword] = useState<String>("");
  const [isMatched, setMatched] = useState(false);

  useEffect(() => {
    if (repassword && password) {
      setMatched(repassword === password);
    } else {
      setMatched(false);
    }
    return () => {};
  }, [password, repassword]);

  return (
    <Box sx={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
      <Box sx={{ height: "22vh", minHeight: "120px" }}>
        <Stack direction={"row"} pt={2}>
          <IconButton onClick={() => navigate("/member/login")}>
            <ArrowBack />
          </IconButton>
        </Stack>
      </Box>
      <Stack component={Form} method={"POST"}>
        <TextField
          type={"text"}
          name={"id"}
          value={id}
          onChange={(e) => setId(e.target.value)}
          label={"아이디"}
          margin={"dense"}
        />
        <TextField
          type={"password"}
          name={"password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label={"비밀번호"}
          margin={"dense"}
        />
        <TextField
          type={"password"}
          name={"re-password"}
          value={repassword}
          onChange={(e) => setRepassword(e.target.value)}
          label={"비밀번호(확인)"}
          margin={"dense"}
          error={!!repassword && !isMatched}
          InputProps={{
            endAdornment: (
              <InputAdornment position={"end"}>
                {isMatched && <CheckCircleOutline color={"success"} />}
              </InputAdornment>
            ),
          }}
        />
        <FormHelperText sx={{ height: "19px" }} error>
          {!!actionData && "중복된 아이디입니다."}
        </FormHelperText>
        <Button
          type={"submit"}
          disabled={!isMatched || !id || !password || !repassword}
        >
          회원가입
        </Button>
      </Stack>
    </Box>
  );
}

export default Signup;
