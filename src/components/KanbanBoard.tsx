"use client"
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { useMemo, useState } from 'react';
import { Column, Id, Task } from '@/utils/types';
import Typography from '@mui/material/Typography';
import ColumnContainer from './ColumnContainer';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import TaskCard from './TaskCard';

const KanbanBoard = () => {

  const [columns, setColumns] = useState<Column[]>([])

  const [tasks, setTasks] = useState<Task[]>([])

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 3,
    }
  }))

  const [open, setOpen] = useState(false);

  const generateId = (): number => {
    // Generate a random number between 0 and 10000
    return Math.floor(Math.random() * 10001);
  }

  const createNewColumn = () => {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`
    };

    const newColumns = [...columns, columnToAdd]
    if (newColumns.length === 5) {
      setOpen(true);
    }
    setColumns(newColumns)
  }

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const deleteColumn = (id: Id) => {
    const filteredColumns = columns.filter(col => col.id != id);
    setColumns(filteredColumns)
    const newTasks = tasks.filter(t => t.columnId !== id);
    setTasks(newTasks);
  }
  const updateColumn = (id: Id, title: string) => {
    const newColumns = columns.map(col => {
      if (col.id !== id) return col;
      return { ...col, title };
    });
    setColumns(newColumns)
  }

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }
  const onDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null)
    setActiveTask(null)
    const { active, over } = event;
    if (!over) return;
    const activeColumnId = active.id;
    const overColumnId = over.id;
    if (activeColumnId === overColumnId) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeColumnId);
      const overColumnIndex = columns.findIndex((col) => col.id === overColumnId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    })
  }
  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // Dropping a task over another task
    if (isActiveATask && isOverATask) {
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(t => t.id === activeId);
        const overIndex = tasks.findIndex(t => t.id === overId);

        tasks[activeIndex].columnId = tasks[overIndex].columnId

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    // Dropping a task over a column 
    if (isOverAColumn && isActiveATask) {
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(t => t.id === activeId);

        tasks[activeIndex].columnId = overId;

        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }

  const createTask = (columnId: Id) => {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length + 1}`
    }

    setTasks([...tasks, newTask])
  }
  const deleteTask = (taskId: Id) => {
    const newTasks = tasks.filter((task) => task.id !== taskId);

    setTasks(newTasks);
  }
  const updateTask = (taskId: Id, content: string) => {
    const newTasks = tasks.map((task) => {
      if (task.id !== taskId) return task;
      return { ...task, content };
    });

    setTasks(newTasks);
  }
  return (
    <div>
      <Box
        sx={{
          margin: 'auto',
          display: 'flex',
          minHeight: '100vh',
          width: '100%',
          alignItems: 'center',
          overflowX: 'auto',
          overflowY: 'hidden',
          px: '40px',
        }}>
        <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd} sensors={sensors} onDragOver={onDragOver}>
          <Box sx={{
            margin: 'auto', display: "flex", gap: 4
          }}>
            <Box sx={{
              display: "flex",
              gap: 4
            }}>
              <SortableContext items={columnsId}>
                {columns.map(column => <ColumnContainer column={column} key={column.id} deleteColumn={deleteColumn} updateColumn={updateColumn} createTask={createTask} tasks={tasks.filter(task => task.columnId === column.id)} deleteTask={deleteTask} updateTask={updateTask} />)}
              </SortableContext>

            </Box>

            {columns.length < 5 && <>
              <Button
                variant="contained"
                sx={{
                  textTransform: 'none',
                  paddingX: 4,
                  width: "280px",
                  height: "48px",
                }}
                endIcon={<AddIcon />}
                onClick={() => {
                  createNewColumn();
                }}
              >
                <Typography variant='subtitle1' component='h2'>
                  Add Column
                </Typography>
              </Button>
              <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={handleClose}
                message="You can add a maximum of 5 columns"
              /></>}
          </Box>
          {createPortal(<DragOverlay>
            {activeColumn && <ColumnContainer column={activeColumn} deleteColumn={deleteColumn} updateColumn={updateColumn} createTask={createTask} tasks={tasks.filter((task) => task.columnId === activeColumn.id)} deleteTask={deleteTask} updateTask={updateTask}
            />}
            {
              activeTask && <TaskCard task={activeTask} deleteTask={deleteTask} updateTask={updateTask} />
            }
          </DragOverlay>, document.body)}
        </DndContext>
      </Box>

    </div>
  );
}

export default KanbanBoard