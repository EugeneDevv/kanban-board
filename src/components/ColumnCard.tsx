import Paper from '@mui/material/Paper';
import { NextPage } from 'next';

interface AppProps {
  onClick: (title: string) => void;
}



const ColumnCarPaper: NextPage<AppProps> = ({ onClick }) => {
  return (
    <Paper
      elevation={1}
      sx={{
        textTransform: 'none',
        paddingX: 4,
        width: '280px',
        height: '54px',
        maxHeight: '100px',
        color: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        fontWeight: 600,
        justifyContent: 'center',
        backgroundColor: 'white',
      }}
      onClick={() => {
        onClick("");
      }}
    >
      Add Column
    </Paper>
  );
};

export default ColumnCarPaper;
