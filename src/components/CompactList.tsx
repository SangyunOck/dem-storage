import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Folder } from "@mui/icons-material";

function CompactList() {
  return (
    <List>
      <ListItem>
        <ListItemButton>
          <ListItemIcon>
            <Folder />
          </ListItemIcon>
          <ListItemText primary={"내 파일"} />
        </ListItemButton>
      </ListItem>
    </List>
  );
}

export default CompactList;
