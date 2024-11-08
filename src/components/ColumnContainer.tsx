"use client"

import { Column, Id, Task } from "@/utils/types"
import { Button, Paper, setRef, TextField, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import DeleteIcon from '@mui/icons-material/Delete';
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities"
import { useMemo, useState } from "react";
import TaskCard from "./TaskCard";

interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;
  createTask: (id: Id) => void;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void;
  tasks: Task[]
}

const ColumnContainer = (props: Props) => {
  const { column, deleteColumn, updateColumn, createTask, tasks, deleteTask, updateTask } = props;
  const [editMode, setEditMode] = useState(false)

  const tasksId = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  }

  if (isDragging) {
    return <div ref={setNodeRef} style={style}>
      <Paper
        variant="outlined"
        sx={{
          background: "white",
          height: 500,
          maxHeight: 500,
          width: 350,
          display: "flex",
          borderColor: "gray",
          flexDirection: "column",
          opacity: "60%"
        }}
      ></Paper>
    </div>
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Paper
        sx={{
          background: "white",
          height: 500,
          maxHeight: 500,
          width: 350,
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Box
          {...attributes}
          {...listeners}
          onClick={() => {
            setEditMode(true)
          }}
          sx={{
            backgroundColor: 'gray',
            fontSize: '1rem',
            cursor: 'grab',
            borderRadius: '4px 4px 0 0',
            padding: '12px',
            fontWeight: 'bold',
            border: '4px solid',
            borderColor: 'white',
            display: "flex",
            justifyContent: "space-between"
          }}>
          <Box
            sx={{
              display: "flex",
              gap: 2,

              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                background: "white",
                paddingX: "2px",
                paddingY: "1px",
                fontSize: '1rem',
                borderRadius: '50%',
              }}
            >0</Box>

            {!editMode && column.title}
            {editMode && <TextField hiddenLabel
              id="outlined-basic"
              onChange={e => updateColumn(column.id, e.target.value)}
              value={column.title}
              variant="outlined"
              size="small"
              onBlur={() => {
                setEditMode(false)
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                setEditMode(false);
              }}
            />}
          </Box>
          <DeleteIcon sx={{ color: "white", cursor: "pointer" }} onClick={() => {
            deleteColumn(column.id);
          }} />
        </Box>

        <Box sx={{
          display: 'flex',
          flexGrow: 1,
          flexDirection: "column",
          gap: 2,
          padding: "2px"
        }}>
          <SortableContext items={tasksId}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} deleteTask={deleteTask} updateTask={updateTask} />
            ))}</ SortableContext>



        </Box>


        <Button variant="text"
          sx={{
            textTransform: 'none',
            paddingX: 4,
            width: "350px",
            height: "48px",
          }}
          onClick={() => { createTask(column.id) }}>Add Task</Button>

      </Paper>

    </div>
  )
}

export default ColumnContainer