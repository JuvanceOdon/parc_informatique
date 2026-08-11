import { Box, Card, InputAdornment, TextField } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import type { ReactNode } from 'react';

interface ListPanelProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children: ReactNode;
  endAdornment?: ReactNode;
}

/** Conteneur de liste stable : recherche + zone grille à hauteur bornée (scroll interne). */
export const ListPanel = ({
  search,
  onSearchChange,
  searchPlaceholder = 'Rechercher…',
  children,
  endAdornment,
}: ListPanelProps) => (
  <Card
    elevation={0}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      bgcolor: 'background.paper',
      // Garde le panneau dans le viewport : évite l’explosion de hauteur avec de longues listes
      height: {
        xs: 'min(70vh, 640px)',
        sm: 'calc(100vh - 220px)',
      },
      minHeight: 360,
      maxHeight: 820,
    }}
  >
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 2,
        px: { xs: 2, sm: 2.5 },
        pt: 2.5,
        pb: 2,
        flexShrink: 0,
      }}
    >
      <TextField
        size="small"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        sx={{
          flex: 1,
          minWidth: 200,
          maxWidth: 420,
          '& .MuiOutlinedInput-root': {
            borderRadius: 999,
            bgcolor: (t) =>
              t.palette.mode === 'light' ? 'rgba(26,54,93,0.04)' : 'rgba(255,255,255,0.04)',
            '& fieldset': { borderColor: 'transparent' },
            '&:hover fieldset': { borderColor: 'divider' },
            '&.Mui-focused fieldset': { borderColor: 'primary.main' },
          },
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          },
        }}
      />
      {endAdornment}
    </Box>
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          px: { xs: 1, sm: 1.5 },
          pb: 1.5,
          display: 'flex',
          flexDirection: 'column',
          '& > .MuiDataGrid-root': {
            flex: 1,
            height: '100% !important',
            width: '100%',
            border: 'none',
          },
        }}
      >
        {children}
      </Box>
    </Box>
  </Card>
);
