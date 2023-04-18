import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';
import { Storage } from 'aws-amplify';
import uuid from 'uuid/v4';
import mime from 'mime-types';
import LinearProgress from '@material-ui/core/LinearProgress';
import SnackBar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import PublishIcon from '@material-ui/icons/Publish';
const getColor = props => {
  if (props.isDragAccept) {
    return '#00e676';
  }
  if (props.isDragReject) {
    return '#ff1744';
  }
  if (props.isDragActive) {
    return '#2196f3';
  }
  return '#eeeeee';
};

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${props => getColor(props)};
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  transition: border 0.24s ease-in-out;
`;

export const UploadImages = props => {
  const { acceptedFiles, getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    accept: 'image/jpeg, image/png',
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (acceptedFiles.length < 1) return;
    async function exec() {
      setLoading(true);
      let processor = acceptedFiles.map(async file => {
        await Storage.put(`${uuid()}.${mime.extension(file.type)}`, file, {
          contentType: file.type,
        });
      });
      await Promise.all(processor);
      setLoading(false);
      setOpen(true);
    }
    exec();
  }, [acceptedFiles]);

  const handleClose = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent> | React.SyntheticEvent<any, Event>, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <div className="container">
      <Container {...getRootProps({ isDragActive, isDragAccept, isDragReject })}>
        <input {...getInputProps()} />
        <PublishIcon style={{ fontSize: '300px' }} />
        <p>Drag 'n' drop some files here, or click / tap to select files</p>
      </Container>
      {loading && <LinearProgress />}
      <SnackBar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        message={<span>Images uploaded!</span>}
        action={[
          <IconButton key="close" aria-label="close" color="inherit" onClick={handleClose}>
            <CloseIcon />
          </IconButton>,
        ]}
      />
    </div>
  );
};
