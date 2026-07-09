import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => (
  <Box className="mb-6 flex flex-wrap items-start justify-between gap-4">
    <Box>
      <Typography variant="h5" color="primary.dark">
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" className="mt-1">
          {subtitle}
        </Typography>
      )}
    </Box>
    {action}
  </Box>
);
