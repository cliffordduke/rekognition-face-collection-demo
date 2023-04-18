import React, { useEffect, useState } from 'react';
import { API } from 'aws-amplify';
import styled from 'styled-components';
import { useLocalStorage } from '../util';
import { useDropzone } from 'react-dropzone';
import { Avatar, Fab } from '@material-ui/core';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import LinearProgress from '@material-ui/core/LinearProgress';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Gallery, { RenderImageProps } from 'react-photo-gallery';

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
export const MyImages = () => {
  const [foundImages, setFoundImages] = useState([]);
  const [searching, setSearching] = useState(false);
  const [user, setUser] = useLocalStorage('user', '');
  const { acceptedFiles, getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    accept: 'image/jpeg, image/png',
    multiple: false,
  });

  const fileToBase64 = (image: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = () => resolve(reader.result.toString());
      reader.onerror = error => reject(error);
    });
  useEffect(() => {
    async function exec() {
      if (acceptedFiles.length < 1) return;
      let file = acceptedFiles[0];
      let imageBase64 = await fileToBase64(file);
      setUser(imageBase64);
    }
    exec();
  }, [acceptedFiles, setUser]);

  useEffect(() => {
    if (!user) return;
    async function exec() {
      setSearching(true);
      let match = user.match(/data:(.*);base64,(.*)/);
      let results = await API.post('API', '/users/search', { body: { image: match[2] } });
      setSearching(false);
      setFoundImages(results.faces);
    }
    exec();
  }, [user]);
  function reset() {
    setUser('');
    setFoundImages([]);
  }

  const imageRenderer: React.ComponentType<RenderImageProps<{}>> = ({ photo }) => (
    <a href={photo.src} target="_blank" rel="noopener noreferrer">
      <img alt={photo.alt} src={photo.src} style={{ objectFit: 'scale-down' }} width={photo.width} height={photo.height} />
    </a>
  );
  return (
    <div className="container">
      <Container {...getRootProps({ isDragActive, isDragAccept, isDragReject })}>
        {user ? (
          <Avatar style={{ width: 250, height: 250, margin: 10 }} src={user} />
        ) : (
          <React.Fragment>
            <input {...getInputProps()} />
            <Avatar style={{ width: 250, height: 250, margin: 10 }}>
              <AccountCircleIcon style={{ width: 250, height: 250 }} />
            </Avatar>
            <p>Drag 'n' drop some files here, or click / tap to select files</p>
          </React.Fragment>
        )}
      </Container>
      {searching && <LinearProgress />}
      <Gallery
        photos={foundImages.map(image => {
          return { src: image.imageKey, width: 1, height: 1 };
        })}
        renderImage={imageRenderer}
      />
      {user && (
        <Fab onClick={reset} style={{ position: 'fixed', bottom: 50, right: 45 }}>
          <ExitToAppIcon />
        </Fab>
      )}
    </div>
  );
};
/*
<GridList cellHeight={300}>
        {foundImages.map(image => (
          <GridListTile key={image.imageKey}>
            <a href={image.imageKey}>
              <img src={image.imageKey} style={{ objectFit: 'scale-down' }} />
            </a>
          </GridListTile>
        ))}
      </GridList>
*/
