import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
} from '@mui/material';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import SecurityIcon from '@mui/icons-material/Security';

import type { GuardrailResult } from '../../types';

interface GuardrailProps {
  logs: GuardrailResult[];
}

const GuardrailLogs: React.FC<GuardrailProps> = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <Card
        sx={{
          borderRadius: 4,
          bgcolor: '#182235',
          border: '1px solid rgba(255,255,255,.06)',
        }}
      >
        <CardContent sx={{ py: 8 }}>
          <Typography align="center" color="text.secondary">
            No AI Guardrail execution logs available.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const passed = logs.filter((l) => l.status === 'pass').length;

  return (
    <Card
      sx={{
        borderRadius: 4,
        background:
          'linear-gradient(180deg,#1d2638 0%,#182235 100%)',
        border: '1px solid rgba(255,255,255,.06)',
      }}
    >
      <CardContent>

        {/* Header */}

        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700 }}
            >
              AI Guardrails Audit Log
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Verification results generated during prompt execution
            </Typography>
          </Box>

          <Chip
            icon={<SecurityIcon />}
            color="success"
            label={`${passed}/${logs.length} Checks Passed`}
          />
        </Box>

        <TableContainer>

          <Table>

            <TableHead>

              <TableRow
                sx={{
                  backgroundColor:
                    'rgba(255,255,255,.03)',
                }}
              >
                <TableCell>
                  <b>Guardrail</b>
                </TableCell>

                <TableCell>
                  <b>Status</b>
                </TableCell>

                <TableCell>
                  <b>Score</b>
                </TableCell>

                <TableCell>
                  <b>Audit Feedback</b>
                </TableCell>

                <TableCell>
                  <b>Verified</b>
                </TableCell>

              </TableRow>

            </TableHead>

            <TableBody>

              {logs.map((log, index) => (

                <TableRow
                  key={log.id}
                  hover
                  sx={{
                    transition: '.2s',

                    backgroundColor:
                      index % 2 === 0
                        ? 'transparent'
                        : 'rgba(255,255,255,.015)',

                    '&:hover': {
                      backgroundColor:
                        'rgba(124,108,246,.08)',
                    },
                  }}
                >
                  <TableCell>

                    <Typography
                      sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                    >
                      {log.check_name.replaceAll('_', ' ')}
                    </Typography>

                  </TableCell>

                  <TableCell>

                    <Chip
                      size="small"
                      icon={
                        log.status === 'pass'
                          ? <CheckCircleIcon />
                          : <ErrorOutlineIcon />
                      }
                      label={log.status.toUpperCase()}
                      color={
                        log.status === 'pass'
                          ? 'success'
                          : 'error'
                      }
                    />

                  </TableCell>

                  <TableCell>

                    <Typography
                      sx={{ fontWeight: 600 }}
                    >
                      {log.score !== undefined
                        ? log.score.toFixed(2)
                        : '--'}
                    </Typography>

                  </TableCell>

                  <TableCell
                    sx={{
                      maxWidth: 420,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {log.feedback || 'No feedback available.'}
                    </Typography>

                  </TableCell>

                  <TableCell>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {new Date(
                        log.verified_at
                      ).toLocaleString()}
                    </Typography>

                  </TableCell>

                </TableRow>

              ))}

            </TableBody>

          </Table>

        </TableContainer>

      </CardContent>

    </Card>
  );
};

export default GuardrailLogs;