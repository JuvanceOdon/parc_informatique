import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
  hint?: string;
}

export const KpiCard = ({ label, value, icon, color, hint }: KpiCardProps) => {
  const theme = useTheme();
  const accent = color ?? theme.palette.primary.main;
  const softBg =
    theme.palette.mode === 'dark' ? `${accent}22` : `${accent}14`;

  return (
    <Card
      className="h-full"
      sx={{
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow:
            theme.palette.mode === 'light'
              ? '0 14px 40px rgba(26, 54, 93, 0.1)'
              : '0 14px 40px rgba(0,0,0,0.45)',
        },
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', lineHeight: 1.2, display: 'block' }}
          >
            {label}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              color: accent,
              fontWeight: 800,
              mt: 0.75,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            {value}
          </Typography>
          {hint && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
              {hint}
            </Typography>
          )}
        </Box>
        {icon && (
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: softBg,
              color: accent,
              flexShrink: 0,
              '& .MuiSvgIcon-root': { fontSize: 26, opacity: 1 },
            }}
          >
            {icon}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
