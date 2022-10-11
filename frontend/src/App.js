import { useState, useEffect } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import CheckIcon from "@mui/icons-material/Check";
import { Input, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { uid } from "uid";
import axios from "axios";

const CustomListItem = styled(ListItem)`
  :hover {
    background-color: ${(props) => (props.completed ? "#94fa75" : "#dbdbdb")};
  }
  background-color: ${(props) => (props.completed ? "#94fa75" : "#f0f0f0")};
`;

function App() {
  const [dense] = useState(false);
  const [val, setVal] = useState("");
  const [todos, setTodos] = useState([]);
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      if (val) addTodo(val);
    }
  };
  const addTodo = async () => {
    try {
      let res = await axios
        .post("/api/todos", { title: val })
        .then((res) => res.data);
      console.log(res);
      setTodos([...todos, res]);

      setVal("");
    } catch (e) {
      console.error("error adding todo", e);
    }
  };

  const deleteTodo = async (_id) => {
    try {
      let res = await axios.delete("/api/todos/" + _id).then((res) => res.data);
      console.log(res);
      setTodos((prev) => prev.filter((todo) => todo._id !== _id));
    } catch (e) {
      console.error("error deleting todo", e);
    }
  };
  const updateTodo = async (_id, data) => {
    try {
      let res = await axios
        .put("/api/todos/" + _id, data)
        .then((res) => res.data);
      console.log(res);

      setTodos((prev) =>
        prev.map((todo) => (todo._id === _id ? { ...todo, ...data } : todo))
      );
    } catch (e) {
      console.error("error updating todo", e);
    }
  };

  useEffect(() => {
    const getTodos = async () => {
      try {
        let res = await axios.get("/api/todos").then((res) => res.data);
        setTodos(res);
      } catch (e) {
        console.error("error fetching todos", e);
      }
    };
    getTodos();
  }, []);

  return (
    <Box>
      <Typography sx={{ mt: 4, mb: 2 }} variant="h3" component="div">
        TODOS !
      </Typography>
      <Box p={2}>
        <Input
          value={val}
          placeholder="type a todo"
          onChange={(e) => setVal(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button onClick={addTodo}>Add</Button>
      </Box>
      <Box bgcolor="#f0f0f0" width="80%">
        <List dense={dense} sx={{ margin: "10px" }}>
          {todos && todos.map((e) => (
            <CustomListItem
              key={e?._id}
              completed={e.completed}
              secondaryAction={
                <Box display="flex" justifyContent="space-between">
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => deleteTodo(e._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="check"
                    onClick={() =>
                      updateTodo(e._id, { completed: !e.completed })
                    }
                  >
                    <CheckIcon color={e.completed ? "light" : "primary"} />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText primary={e.title} />
            </CustomListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
}

export default App;
