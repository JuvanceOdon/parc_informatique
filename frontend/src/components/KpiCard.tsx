import { Box, Card, CardContent, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
}

export const KpiCard = ({ label, value, icon, color = '#1a365d' }: KpiCardProps) => (
  <Card className="h-full">
    <CardContent className="flex items-start justify-between gap-3">
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" sx={{ color, fontWeight: 700, mt: 0.5 }}>
          {value}
        </Typography>
      </Box>
      {icon}
    </CardContent>
  </Card>
);
