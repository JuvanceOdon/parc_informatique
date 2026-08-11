import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar, SIDEBAR_WIDTH } from './Sidebar';
import { TopBar } from './TopBar';

export const AppLayout = () => (
  <Box className="flex min-h-screen">
    <Sidebar />
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <TopBar />
      <Box className="px-4 py-5 sm:px-6 sm:py-6">
        <Outlet />
      </Box>
    </Box>
  </Box>
);
