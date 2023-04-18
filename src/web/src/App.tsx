import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { MyImages, UploadImages } from './components';
import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      <Box p={3}>{children}</Box>
    </Typography>
  );
}

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function SimpleTabs() {
  const [tab, setTab] = React.useState(0);

  const tabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };

  return (
    <div>
      <AppBar position="static">
        <Tabs value={tab} onChange={tabChange} aria-label="AWS Event Photo Manager" centered>
          <Tab label="Photos of me" {...a11yProps(0)} />
          <Tab label="Upload Photos" {...a11yProps(1)} />
        </Tabs>
      </AppBar>
      <Container maxWidth="lg">
        <TabPanel value={tab} index={0}>
          <MyImages />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <UploadImages />
        </TabPanel>
      </Container>
    </div>
  );
}
