"use client"
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { NextPage } from 'next';
import { useState } from 'react';
import Box from '@mui/material/Box';
import { toast } from 'react-toastify';
import { useMutation } from '@apollo/client';
import { ADD_TASK } from '@/app/api/graphql/mutations';
import { GET_COLUMNS_AND_TASKS } from '@/app/api/graphql/queries';

interface AppProps {
  columnId: string;
}

const AddCardButton: NextPage<AppProps> = ({ columnId }) => {
  const [editMode, setEditMode] = useState(false);
  const [content, setContent] = useState("");

  /** Mutation to add a new task and refetch columns and tasks on success */
  const [addTask] = useMutation(ADD_TASK, {
    refetchQueries: [{ query: GET_COLUMNS_AND_TASKS }]
  });

  /** Toggles the edit mode for adding a new task */
  const toggleEditMode = () => {
    setEditMode(prev => !prev);
  };

  /** Submits a new task content, shows feedback, and resets the form */
  const handleSubmit = async () => {
    try {
      if (content.trim().length < 1) {
        toast.warning("Enter a valid task name");
        return;
      }
      const response = await addTask({ variables: { columnId, content } });
      const { statusCode, message } = response.data.addTask;

      if (statusCode === 201) {
        toast.success(message);
        setContent("");
        toggleEditMode();
      } else {
        toast.warning(message);
      }
    } catch (error) {
      toast.error("An error occurred while adding card.");
    }
  };

  return editMode ? (
    <Paper
      elevation={1}
      sx={{
        paddingY: "4px",
        paddingX: "8px",
        width: 350,
        minHeight: "54px",
        maxHeight: "120px",
        color: "primary.main",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        alignItems: "center",
        fontWeight: 600,
        justifyContent: "center",
        backgroundColor: "white",
      }}
    >
      <TextField
        id="outlined-basic"
        label="Title"
        autoFocus
        variant="outlined"
        fullWidth
        onChange={(e) => setContent(e.target.value)}
      />
      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <Button
          variant='text'
          sx={{ textTransform: 'none' }}
          onClick={() => {
            toggleEditMode();
            setContent("");
          }}
        >
          Cancel
        </Button>
        <Button
          variant='contained'
          sx={{ textTransform: 'none' }}
          onClick={handleSubmit}
        >
          Add
        </Button>
      </Box>
    </Paper>
  ) : (
    <Paper
      elevation={1}
      sx={{
        textTransform: 'none',
        paddingX: 4,
        width: 350,
        height: "54px",
        color: "primary.main",
        display: "flex",
        alignItems: "center",
        fontWeight: 600,
        justifyContent: "center",
        backgroundColor: "white",
        cursor: "pointer"
      }}
      onClick={toggleEditMode}
    >
      Add Card
    </Paper>
  );
};

export default AddCardButton;
