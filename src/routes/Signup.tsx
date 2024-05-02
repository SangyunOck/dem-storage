import { Form, useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Button, IconButton, TextField } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

export const signupAction = async ({ request }: { request: Request }) => {
  const data = await request.formData();
  //TODO: api 연결 테스트 + res 반응 ui 추가
  data.delete("re-password");
  return axios
    .post("/member", data)
    .then((res) => {
      console.log(res);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      return err;
    });
};

function Signup() {
  const navigate = useNavigate();

  return (
    <Form method={"POST"}>
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          navigate("/member/login");
        }}
      >
        <ArrowBack />
      </IconButton>
      <Box sx={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
        <TextField type={"text"} name={"id"} label={"아이디"} />
        <TextField type={"password"} name={"password"} label={"비밀번호"} />
        <TextField
          type={"password"}
          name={"re-password"}
          label={"비밀번호(재입력)"}
        />
        <Button type={"submit"}>회원가입</Button>
      </Box>
    </Form>
  );
}

export default Signup;
