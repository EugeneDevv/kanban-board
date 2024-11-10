"use client"
import { Id, Task } from "@/utils/types"
import Box from "@mui/material/Box/Box"
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities"
import { NextPage } from "next";

interface AppProps {
  task: Task,
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, value: string) => void;
}


const TaskCard: NextPage<AppProps> = ({ task, deleteTask, updateTask }) => {

  const [mouseIsOver, setMouseIsOver] = useState(false)
  const [editMode, setEditMode] = useState(false);

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
          boxShadow: `inset 0 0 0 2px rgb(244, 114, 182)`, // `ring-rose-500` equivalent color
          ringColor: 'rgb(244, 114, 182)',
        },
      }}
    >
      <textarea className="textarea" value={task.content} autoFocus placeholder="Task content here"
        onBlur={toggleEditMode}
        onKeyDown={e => {
          if (e.key === "Enter" && e.shiftKey) toggleEditMode();

        }}
        onChange={(e) => updateTask(task.id, e.target.value)}
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
        color: "white", cursor: "pointer", position: "absolute", right: 4, top: 40, opacity: "60%", '&:hover': {
          opacity: "100%",
        },
      }} onClick={() => {
        deleteTask(task.id);
      }} />}
    </Box>
  )
}

export default TaskCard