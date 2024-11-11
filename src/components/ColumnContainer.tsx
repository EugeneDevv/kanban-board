"use client"

import { Column, Id, Task } from "@/utils/types"
import { Menu, MenuItem, Paper, setRef, TextField, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities"
import { useMemo, useState } from "react";
import TaskCard from "./TaskCard";
import { NextPage } from "next";
import { useMutation } from "@apollo/client";
import { GET_COLUMNS_AND_TASKS } from "@/app/api/graphql/queries";
import { DELETE_COLUMN, DELETE_TASKS, UPDATE_COLUMN } from "@/app/api/graphql/mutations";
import { toast } from "react-toastify";
import { MoreHoriz } from "@mui/icons-material";
import AddCardButton from "./AddCardButton";

interface AppProps {
  column: Column;
  tasks: Task[]
}

const ColumnContainer: NextPage<AppProps> = ({ column, tasks }) => {

  // States for edit mode, column title, and menu anchor element
  const [editMode, setEditMode] = useState(false)
  const [title, setTitle] = useState(column.title)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Memoized task IDs to prevent recalculating on each render
  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  // Sortable context and handlers for drag-and-drop functionality
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column
    },
    disabled: editMode,
  });

  // Style transformation during drag events
  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  }

  // GraphQL mutations for column and task operations
  const [deleteColumn] = useMutation(DELETE_COLUMN, {
    refetchQueries: [{ query: GET_COLUMNS_AND_TASKS }]
  });

  const [updateColumn] = useMutation(UPDATE_COLUMN, {
    refetchQueries: [{ query: GET_COLUMNS_AND_TASKS }]
  });

  const [deleteTasks] = useMutation(DELETE_TASKS, {
    refetchQueries: [{ query: GET_COLUMNS_AND_TASKS }]
  });

  // Handles deletion of the column
  const handleDelete = async () => {
    try {
      const response = await deleteColumn({ variables: { id: `${column.id}` } });
      const { statusCode, message } = response.data.deleteColumn;

      if (statusCode === 200) {
        toast.success(message); // Show success toast for status 200
      } else {
        toast.warning(message); // Show warning toast for other statuses
      }
    } catch (error) {
      toast.error("An error occurred while deleting the column.");
    }
  };
  // Handles renaming the column
  const handleUpdate = async () => {
    if (column.title !== title) {
      try {
        if (title.trim().length < 1) {
          toast.warning("Enter a valid column name");
        }
        const response = await updateColumn({ variables: { id: `${column.id}`, title } });
        const { statusCode, message } = response.data.updateColumn;

        if (statusCode === 200) {
          toast.success(message); // Show success toast for status 200
        } else {
          toast.warning(message); // Show warning toast for other statuses
        }
      } catch (error) {
        toast.error("An error occurred while updating column.");
      }
    } else {
      setEditMode(false)
    }
  };

  // Clears all tasks within the column
  const handleClearTasks = async () => {
    if (tasks.length > 0) {
      try {
        const response = await deleteTasks({ variables: { ids: tasksIds } });
        const { statusCode, message } = response.data.deleteTasks;

        if (statusCode === 200) {
          toast.success(message);
          setAnchorEl(null);
        } else {
          toast.error(message); // Show warning toast for other statuses
        }
      } catch (error) {
        toast.error("An error occurred while clearing column.");
      }
    } else {
      setAnchorEl(null);
    }
  };

  // Toggle edit mode for renaming
  const handleRename = () => {
    setEditMode(true);
    setAnchorEl(null); // Close the menu after selecting Rename
  };

  // Handle menu open and close
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Return alternative view during drag
  if (isDragging) {
    return <div ref={setNodeRef} style={style}>
      <Paper
        variant="outlined"
        sx={{
          background: "secondary.main",
          minHeight: 100,
          maxHeight: "80vh",
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
          backgroundColor: "#ededed",
          minHeight: 80,
          maxHeight: "80vh",
          width: 350,
          display: "flex",
          overflowY: "auto",
          overflowX: "hidden",
          gap: "4px",
          flexDirection: "column",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#ededed",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#1976d2", // Blue color
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#1976d2", // Darker blue on hover
          },
        }}
      >
        <Box
          {...attributes}
          {...listeners}
          sx={{
            position: "sticky",
            top: 0,
            backgroundColor: 'white',
            fontSize: '1rem',
            cursor: 'grab',
            zIndex: 10,
            borderRadius: '4px 4px 0 0',
            padding: '12px',
            fontWeight: 'bold',
            display: "flex",
            justifyContent: "space-between"
          }}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
            }}
            onClick={() => {
              setEditMode(true)
            }}
          >
            {!editMode && column.title}
            {editMode && <TextField
              label="Name"
              fullWidth
              id="outlined-basic"
              onChange={e => setTitle(e.target.value)}
              value={title}
              variant="outlined"
              size="small"
              onBlur={() => {
                setEditMode(false)
                handleUpdate();
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                setEditMode(false);
                handleUpdate();
              }}
            />}
          </Box>
          <Box
            onClick={handleMenuOpen}
          >
            <MoreHoriz
              sx={{ cursor: "pointer" }}
            />
          </Box>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleRename}>Rename</MenuItem>
          {tasks.length > 0 && <MenuItem onClick={handleClearTasks}>Clear</MenuItem>}
          <MenuItem onClick={handleDelete}>Delete</MenuItem>
        </Menu>
        {tasks.length === 0 ? (<Box
          sx={{
            padding: 2.5,
            backgroundColor: "white",
            height: "80px",
          }}
          className="task"
        />) : (<Box sx={{
          display: 'flex',
          flexGrow: 1,
          flexDirection: "column",
          gap: "4px",
          padding: "2px"
        }}>
          <SortableContext items={tasksIds}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}</ SortableContext>
        </Box>
        )}
        <Box sx={{ position: "sticky", bottom: 0 }}>
          <AddCardButton columnId={column.id.toString()} />
        </Box>
      </Paper>

    </div>
  )
}

export default ColumnContainer