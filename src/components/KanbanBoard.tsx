"use client"
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';
import { Column, Id, Task } from '@/utils/types';
import ColumnContainer from './ColumnContainer';
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import TaskCard from './TaskCard';
import { useMutation, useQuery } from '@apollo/client';
import { GET_COLUMNS_AND_TASKS } from '@/app/api/graphql/queries';
import { MOVE_TASK, SWAP_COLUMNS } from '@/app/api/graphql/mutations';
import AddColumnCard from './AddColumnCard';
import { toast } from 'react-toastify';

type KanbanContextType = {
  columns: Column[];
  tasks: Task[];
  handleColumnSwap: (activeColumnId: string, overColumnId: string) => Promise<void>;
  handleMoveTask: (activeTaskId: string, overTaskId: string, columnId: string) => Promise<void>;
};

const KanbanBoard = () => {
  // GraphQL mutations for swapping columns and moving tasks
  const [swapColumns] = useMutation(SWAP_COLUMNS, {
    refetchQueries: [{ query: GET_COLUMNS_AND_TASKS }]
  });
  const [moveTask] = useMutation(MOVE_TASK, {
    refetchQueries: [{ query: GET_COLUMNS_AND_TASKS }]
  });

  // State to manage columns and tasks locally
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // State to track the active column and task during drag events
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Initialize sensors for drag events with `PointerSensor`
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 3,
    }
  }))

  // Query to fetch columns and tasks data
  const { data, loading, error } = useQuery(GET_COLUMNS_AND_TASKS);

  // Set fetched data to local state once loaded
  useEffect(() => {
    if (data) {
      setColumns(data.columns || []);
      setTasks(data.tasks || []);
    }
  }, [data]);

  if (loading) return <p>Loading...</p>
  if (error) return <p>Oops! Something went wrong...</p>


  let columnIDs: Id[] = [];
  if (!loading && !error && data) {
    columnIDs = columns.map((col) => col.id);
  }

  // Handles swapping of columns on drag end
  const handleColumnSwap = async (activeColumnId: string, overColumnId: string) => {
    try {
      const response = await swapColumns({ variables: { activeColumnId, overColumnId } });
      const { statusCode, message } = response.data.swapColumns;

      if (statusCode === 200) {
        toast.success(message); // Show success toast for status 200
      } else {
        toast.warning(message); // Show warning toast for other statuses
      }
    } catch (error) {
      console.log(error);

      toast.error("An error occurred while moving column.");
    }
  };

  // Handles task movement within or between columns
  const handleMoveTask = async (activeTaskId: string, overTaskId: string, columnId: string) => {
    try {
      const response = await moveTask({ variables: { activeTaskId, overTaskId, columnId } });
      const { statusCode, message } = response.data.moveTask;

      if (statusCode !== 200) {
        toast.warning(message); // Show warning toast for other statuses
      }
    } catch (error) {
      console.log(error);

      toast.error("An error occurred while moving task.");
    }
  };

  // Handles column swapping on drag end
  const onDragEnd = async (event: DragEndEvent) => {
    setActiveColumn(null)
    setActiveTask(null)
    const { active, over } = event;
    if (!over) return;
    const activeColumnId = active.id;
    const overColumnId = over.id;
    if (activeColumnId === overColumnId) return;
    if (event.active.data.current?.type === "Column") {
      setColumns((columns) => {
        const activeColumnIndex = columns.findIndex((col) => col.id === activeColumnId);
        const overColumnIndex = columns.findIndex((col) => col.id === overColumnId);

        return arrayMove(columns, activeColumnIndex, overColumnIndex);
      })
      handleColumnSwap(activeColumnId.toString(), overColumnId.toString());}
  }

  // Sets active column or task on drag start
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

  // Handles task movement on drag over other tasks or columns
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
      handleMoveTask(activeId.toString(), overId.toString(), "");
    }

    const isOverAColumn = over.data.current?.type === "Column";

    // Dropping a task over a column 
    if (isOverAColumn && isActiveATask) {
      handleMoveTask(activeId.toString(), activeId.toString(), overId.toString());
    }
  }

  return (
    <div>
      <Box
        sx={{
          marginY: '2vh',
          marginX: "auto",
          display: 'flex',
          minHeight: '96vh',
          width: '100%',
          alignItems: "flex-start",
          overflowX: 'auto',
          overflowY: 'hidden',
          paddingX: "40px",
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
        }}>
        <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd} sensors={sensors} onDragOver={onDragOver}>
          <Box sx={{
            margin: 'auto', display: "flex", gap: 4
          }}>
            <Box sx={{
              display: "flex",
              gap: 4
            }}>
              <SortableContext items={columnIDs}>
                {columns.map(column => <ColumnContainer column={column} key={column.id} tasks={tasks.filter(task => task.columnId === column.id)} />)}
              </SortableContext>

            </Box>

            {columns.length < 5 &&
              <AddColumnCard columnCount={columns.length} />}
          </Box>
          {createPortal(<DragOverlay>
            {activeColumn && <ColumnContainer column={activeColumn} tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
            />}
            {
              activeTask && <TaskCard task={activeTask} />
            }
          </DragOverlay>, document.body)}
        </DndContext>
      </Box>

    </div>
  );
}

export default KanbanBoard
