import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { CelebrationOutlined } from "@mui/icons-material";

function NewMember() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [params, _] = useSearchParams();

  return (
    <Box sx={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
      <Box sx={{ height: "22vh", minHeight: "120px" }}></Box>
      <Stack spacing={2}>
        <Box display={"flex"} alignItems={"end"}>
          <CelebrationOutlined sx={{ fontSize: theme.spacing(12) }} />
          <Typography variant={"h4"}>회원가입 완료!</Typography>
        </Box>
        <Card>
          <CardContent>
            <Typography>
              아이디:{" "}
              <span style={{ fontWeight: "bold" }}>{params.get("id")}</span>
            </Typography>
          </CardContent>
        </Card>
        <Button onClick={() => navigate("/member/login")}>
          로그인 하러가기
        </Button>
      </Stack>
    </Box>
  );
}

export default NewMember;
