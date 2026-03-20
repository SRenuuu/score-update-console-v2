import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import DevicesIcon from '@mui/icons-material/Devices';
import SendIcon from '@mui/icons-material/Send';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../../firebase/config';
import Dashboard from '../../components/Dashboard';

function StatCard({ icon, value, label, bgcolor, loading }) {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor,
        color: 'white',
        borderRadius: 2,
      }}
    >
      <Box sx={{ fontSize: 40, mb: 1, opacity: 0.9 }}>{icon}</Box>
      {loading ? (
        <Skeleton variant="text" width={48} height={52} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
      ) : (
        <Typography variant="h3" fontWeight="700" lineHeight={1}>
          {value}
        </Typography>
      )}
      <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.85, letterSpacing: 0.5 }}>
        {label}
      </Typography>
    </Paper>
  );
}

function PlatformChip({ platform }) {
  if (!platform) return <Chip label="All Platforms" size="small" icon={<DevicesIcon />} variant="outlined" />;
  if (platform === 'ios')
    return <Chip label="iOS" size="small" icon={<PhoneIphoneIcon />} color="primary" />;
  if (platform === 'android')
    return <Chip label="Android" size="small" icon={<PhoneAndroidIcon />} color="success" />;
  return null;
}

function formatTimestamp(ts) {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Notifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [platform, setPlatform] = useState('all');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState(null);

  const [pastNotifications, setPastNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  const [iosDevices, setIosDevices] = useState(0);
  const [androidDevices, setAndroidDevices] = useState(0);
  const [devicesLoading, setDevicesLoading] = useState(true);

  // Live device count from pushTokens collection
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'pushTokens'), (snapshot) => {
      let ios = 0;
      let android = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.expoToken) {
          if (data.platform === 'ios') ios++;
          else if (data.platform === 'android') android++;
        }
      });
      setIosDevices(ios);
      setAndroidDevices(android);
      setDevicesLoading(false);
    });
    return () => unsub();
  }, []);

  // Live past notifications (latest 50, newest first)
  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setPastNotifications(results);
        setNotificationsLoading(false);
      },
      (err) => {
        console.error('Notifications fetch error:', err);
        setNotificationsLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handlePlatformChange = (_, newVal) => {
    if (newVal !== null) setPlatform(newVal);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setIsSending(true);
    setSendSuccess(false);
    setSendError(null);

    const doc = {
      title: title.trim(),
      body: body.trim(),
      createdAt: serverTimestamp(),
    };
    if (platform !== 'all') doc.platform = platform;

    try {
      await addDoc(collection(db, 'notifications'), doc);
      setSendSuccess(true);
      setTitle('');
      setBody('');
      setPlatform('all');
    } catch (err) {
      setSendError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const totalDevices = iosDevices + androidDevices;

  return (
    <Dashboard>
      <Grid container spacing={3}>

        {/* Page header */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <NotificationsActiveIcon color="primary" sx={{ fontSize: 30 }} />
            <Typography variant="h5" fontWeight="700">
              Push Notifications
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Send push notifications to app users. A cloud function delivers them instantly upon save.
          </Typography>
        </Grid>

        {/* Stats */}
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={<DevicesIcon fontSize="inherit" />}
            value={totalDevices}
            label="Total Devices"
            bgcolor="#1565c0"
            loading={devicesLoading}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={<PhoneIphoneIcon fontSize="inherit" />}
            value={iosDevices}
            label="iOS Devices"
            bgcolor="#0d47a1"
            loading={devicesLoading}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={<PhoneAndroidIcon fontSize="inherit" />}
            value={androidDevices}
            label="Android Devices"
            bgcolor="#1b5e20"
            loading={devicesLoading}
          />
        </Grid>

        {/* Compose form */}
        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
              <SendIcon color="primary" />
              <Typography variant="h6" fontWeight="600">
                Compose Notification
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSend} noValidate>
              <TextField
                label="Title"
                fullWidth
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                inputProps={{ maxLength: 100 }}
                helperText={`${title.length}/100`}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Body"
                fullWidth
                required
                multiline
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                inputProps={{ maxLength: 300 }}
                helperText={`${body.length}/300`}
                sx={{ mb: 3 }}
              />

              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Target Platform
              </Typography>
              <ToggleButtonGroup
                value={platform}
                exclusive
                onChange={handlePlatformChange}
                fullWidth
                color="primary"
                sx={{ mb: 3 }}
              >
                <ToggleButton value="all" sx={{ gap: 0.5 }}>
                  <DevicesIcon fontSize="small" /> All
                </ToggleButton>
                <ToggleButton value="ios" sx={{ gap: 0.5 }}>
                  <PhoneIphoneIcon fontSize="small" /> iOS
                </ToggleButton>
                <ToggleButton value="android" sx={{ gap: 0.5 }}>
                  <PhoneAndroidIcon fontSize="small" /> Android
                </ToggleButton>
              </ToggleButtonGroup>

              {sendSuccess && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSendSuccess(false)}>
                  Notification queued successfully! The cloud function will deliver it now.
                </Alert>
              )}
              {sendError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSendError(null)}>
                  {sendError}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSending || !title.trim() || !body.trim()}
                endIcon={
                  isSending ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <SendIcon />
                  )
                }
                sx={{ py: 1.5, fontWeight: 600 }}
              >
                {isSending ? 'Sending…' : 'Send Notification'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Past notifications */}
        <Grid item xs={12} md={7}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
              <NotificationsIcon color="action" />
              <Typography variant="h6" fontWeight="600">
                Past Notifications
              </Typography>
              {!notificationsLoading && (
                <Chip
                  label={pastNotifications.length}
                  size="small"
                  color="default"
                  sx={{ ml: 'auto' }}
                />
              )}
            </Box>
            <Divider sx={{ mb: 1 }} />

            {notificationsLoading ? (
              <Box sx={{ pt: 1 }}>
                {[...Array(4)].map((_, i) => (
                  <Box key={i} sx={{ mb: 2 }}>
                    <Skeleton width="60%" height={22} />
                    <Skeleton width="90%" height={18} />
                    <Skeleton width="35%" height={14} />
                  </Box>
                ))}
              </Box>
            ) : pastNotifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <NotificationsIcon sx={{ fontSize: 56, opacity: 0.2, mb: 1 }} />
                <Typography variant="body2">No notifications sent yet.</Typography>
              </Box>
            ) : (
              <List disablePadding sx={{ maxHeight: 480, overflowY: 'auto', pr: 0.5 }}>
                {pastNotifications.map((n, index) => (
                  <React.Fragment key={n.id}>
                    {index > 0 && <Divider component="li" />}
                    <ListItem alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
                      <ListItemText
                        disableTypography
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.4 }}>
                            <Typography variant="subtitle2" fontWeight="600">
                              {n.title}
                            </Typography>
                            <PlatformChip platform={n.platform} />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.primary" sx={{ mb: 0.3, lineHeight: 1.5 }}>
                              {n.body}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTimestamp(n.createdAt)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Dashboard>
  );
}
