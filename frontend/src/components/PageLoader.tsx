import { CircularProgress, Box } from '@mui/material';

export const PageLoader = () => (
  <Box className="flex min-h-[40vh] items-center justify-center">
    <CircularProgress />
  </Box>
);
