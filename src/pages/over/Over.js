import React from 'react';
import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';

import Dashboard from '../../components/Dashboard';
import { useMatchSetup } from "../../hooks/useMatchSetup";
import { useCollection } from '../../hooks/useCollection';
import { useInning } from '../../hooks/useInning';
import { useNewOver } from '../../hooks/useNewOver';

export default function Over() {

    const [bowler, setBowler] = useState('');
    const { updateBowler } = useNewOver();

    useMatchSetup();
    const { team, field } = useInning();
    const { documents } = useCollection('players');

    const handleSubmit = (e) => {
        e.preventDefault();
        updateBowler(bowler);
    }


    return (
        <Dashboard>
            <Grid item xs={12} md={12} lg={12}>
                <Paper
                    sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                 <Box
                    sx={{
                    marginTop: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    }}
                >
                    <Typography component="h1" variant="h5" gutterBottom>
                        New Over
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <InputLabel id="team-label">Bowler</InputLabel>
                    <Select
                        labelId="team-label"
                        id="team-select"
                        required
                        fullWidth
                        value={bowler}
                        label="Team"
                        onChange={(e) => setBowler(e.target.value)}
                    >
                        {documents && team && documents.filter(player => player.team === field).map((player) => (
                            <MenuItem 
                                value={player.playerName}
                                key={player.id}
                            >
                                    {player.playerName}
                            </MenuItem>
                        ))}
                    </Select>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Start Over
                    </Button>
                    </Box>
                    </Box>
                </Paper>
            </Grid>
        </Dashboard>
    )
}