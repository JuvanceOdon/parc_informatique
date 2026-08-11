import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => (
  <Box
    className="mb-6 flex flex-wrap items-end justify-between gap-4"
    sx={{
      pb: 0.5,
    }}
  >
    <Box>
      <Typography
        variant="h4"
        color="text.primary"
        sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', sm: '1.85rem' }, letterSpacing: '-0.03em' }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 520 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    {action}
  </Box>
);
