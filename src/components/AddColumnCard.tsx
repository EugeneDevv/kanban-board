"use client"
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { NextPage } from 'next';
import { useState } from 'react';
import Box from '@mui/material/Box';
import { toast } from 'react-toastify';
import { useMutation } from '@apollo/client';
import { ADD_COLUMN } from '@/app/api/graphql/mutations';
import { GET_COLUMNS_AND_TASKS } from '@/app/api/graphql/queries';

interface AppProps{
  columnCount : number
}

const AddColumnCard: NextPage<AppProps> = ({ columnCount }) => {
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");

  /** Mutation to add a new column and refetch columns and tasks on success */
  const [addColumn] = useMutation(ADD_COLUMN, {
    refetchQueries: [{ query: GET_COLUMNS_AND_TASKS }]
  });

  /** Toggles the edit mode for adding a new column */
  const toggleEditMode = () => {
    setEditMode(prev => !prev);
  };

  /** Submits a new column title, shows feedback, and resets the form */
  const handleSubmit = async () => {
    try {
      if (title.trim().length < 1) {
        toast.warning("Enter a valid column name");
        return;
      }
      const response = await addColumn({ variables: { title } });
      const { statusCode, message } = response.data.addColumn;

      if (statusCode === 201) {
        if (columnCount > 3) {
          toast.info("You can only create 5 columns");
        }
        toast.success(message);
        setTitle("");
        toggleEditMode();
      } else {
        toast.warning(message);
      }
    } catch (error) {
      toast.error("An error occurred while adding column.");
    }
  };

  return editMode ? (
    <Paper
      elevation={1}
      sx={{
        paddingY: "4px",
        paddingX: "8px",
        width: "280px",
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
        label="Name"
        autoFocus
        variant="outlined"
        fullWidth
        onChange={(e) => setTitle(e.target.value)}
      />
      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <Button
          variant='text'
          sx={{ textTransform: 'none' }}
          onClick={() => {
            toggleEditMode();
            setTitle("");
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
        width: "280px",
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
      Add Column
    </Paper>
  );
};

export default AddColumnCard;
