"use client"
import { Task } from "@/utils/types"
import Box from "@mui/material/Box/Box"
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities"
import { NextPage } from "next";
import TextField from "@mui/material/TextField";
import { useMutation } from "@apollo/client";
import { DELETE_TASKS, UPDATE_TASK } from "@/app/api/graphql/mutations";
import { GET_COLUMNS_AND_TASKS } from "@/app/api/graphql/queries";
import { toast } from "react-toastify";

interface AppProps {
  task: Task,
}

// TaskCard: Displays a task with options to edit, delete, and drag-and-drop
const TaskCard: NextPage<AppProps> = ({ task }) => {

  const [deleteTasks] = useMutation(DELETE_TASKS, {
    refetchQueries: [{ query: GET_COLUMNS_AND_TASKS }]
  });
  const [updateTask] = useMutation(UPDATE_TASK, {
    refetchQueries: [{ query: GET_COLUMNS_AND_TASKS }]
  });

  const [mouseIsOver, setMouseIsOver] = useState(false)
  const [editMode, setEditMode] = useState(false);
  const [content, setContent] = useState(task.content);

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  }


  const toggleEditMode = () => {
    setEditMode(prev => !prev);
    setMouseIsOver(false)
  }

  const handleDelete = async () => {
    try {
      const response = await deleteTasks({ variables: { ids: [task.id.toString()] } });
      const { statusCode, message } = response.data.deleteTasks;

      if (statusCode === 200) {
        toast.success(message);
      } else {
        toast.error(message); // Show warning toast for other statuses
      }
    } catch (error) {
      toast.error("An error occurred while clearing column.");
    }

  };
  const handleUpdate = async () => {
    if (content !== task.content) {
      try {
        const response = await updateTask({ variables: { id: task.id.toString(), content } });
        const { statusCode, message } = response.data.updateTask;

        if (statusCode === 200) {
          toast.success(message);
          toggleEditMode();
        } else {
          toast.error(message); // Show warning toast for other statuses
        }
      } catch (error) {
        toast.error("An error occurred while clearing column.");
      }
    } else {
      toggleEditMode();
    }

  };

  if (isDragging) {
    return <Box
      ref={setNodeRef}
      style={style}
      sx={{
        padding: 2.5,
        backgroundColor: "white",
        height: "100px",
        display: "flex",
        textAlign: "left",
        alignItems: "center",
        position: "relative",
        borderColor: "gray",
        cursor: "grab",
        opacity: "30%",
        '&:hover': {
          ring: '2px',
          boxShadow: `inset 0 0 0 2px rgb(244, 114, 182)`, // `ring-rose-500` equivalent color
          ringColor: 'rgb(244, 114, 182)',
        },
      }}
    ></Box>;
  }

  if (editMode) {
    return <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        padding: "4px",
        backgroundColor: "white",
        maxHeight: "100px",
        minHeight: "60px",
        display: "flex",
        textAlign: "left",
        alignItems: "center",
        position: "relative",
        cursor: "grab",
      }}
    >
      <TextField className="textarea" value={content} autoFocus placeholder="Task content here"
        onBlur={toggleEditMode}
        onKeyDown={e => {
          if (e.key === "Enter") handleUpdate();
        }}
        onChange={(e) => setContent(e.target.value)}
      />

    </Box>
  }
  return (
    <Box
      onClick={toggleEditMode}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        padding: 2.5,
        backgroundColor: "white",
        maxHeight: "100px",
        minHeight: "60px",
        display: "flex",
        textAlign: "left",
        alignItems: "center",
        position: "relative",
        cursor: "grab",
        '&:hover': {
          ring: '2px',
          boxShadow: `inset 0 0 0 2px #ededed`, // `ring-rose-500` equivalent color
          ringColor: '#ededed',
        },
      }}
      className="task"
      onMouseEnter={() => {
        setMouseIsOver(true);
      }}
      onMouseLeave={() => {
        setMouseIsOver(false);
      }}
    >
      <p className="task-content">{task.content}</p>

      {mouseIsOver && <DeleteIcon sx={{
        cursor: "pointer", right: 2, top: 40, opacity: "60%", '&:hover': {
          opacity: "100%",
        },
      }} onClick={handleDelete} />}
    </Box>
  )
}

export default TaskCard