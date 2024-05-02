import { Form, Link } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  Link as MLink,
  TextField,
  Typography,
} from "@mui/material";

export const loginAction = async ({ request }: { request: Request }) => {
  const data = await request.formData();
  //TODO: api 연결 테스트 + res 반응 ui 추가
  return axios
    .post("/member/login", data)
    .then((res) => {
      console.log(res);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      return err;
    });
};

function Login() {
  return (
    <Form method={"POST"}>
      <Box sx={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
        <TextField type={"text"} name={"id"} label={"아이디"} />
        <TextField type={"password"} name={"password"} label={"비밀번호"} />
        <Button type={"submit"}>로그인</Button>
        <MLink component={Link} to={"/member/signup"}>
          <Typography variant={"caption"}>회원가입 하러가기</Typography>
        </MLink>
      </Box>
    </Form>
  );
}

export default Login;
