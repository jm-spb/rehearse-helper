/* eslint-disable no-param-reassign */
import { useState, useCallback } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import { useDropzone } from 'react-dropzone';
import * as musicMetadata from 'music-metadata-browser';
import styles from './Player.module.scss';
import 'react-h5-audio-player/lib/styles.css';

const Player = () => {
  const [playList, setPlayList] = useState<File[]>([]);
  const [songPlay, setSongPlay] = useState<string | undefined>();

  console.log(playList);

  const downLoadPlayList = (e: File[]) => {
    const listsongs = [...e];

    listsongs.forEach((el: any) => {
      musicMetadata.parseBlob(el).then((tags) => {
        if (tags) {
          el.artist = tags.common.artist;
          el.album = tags.common.album;
          el.title = tags.common.title;
          el.year = tags.common.year;
          el.images = tags.common.picture;
          // el.images = tags.common.picture ? imageСonverter(tags.common.picture[0].data) : null
          // playList.push(el);
          setPlayList((prev) => [...prev, ...listsongs]);
        } else {
          setPlayList((prev) => [...prev, ...listsongs]);
        }
      });
    });

    // setPlayList((prev) => [...prev, ...listsongs]);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    downLoadPlayList(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const playSong = (index: number) => {
    setSongPlay(URL.createObjectURL(playList[index]));
  };

  return (
    <main className={styles.main}>
      <article className={styles.playerWrap}>
        <AudioPlayer
          className={styles.player}
          autoPlay
          src={songPlay}
          onPlay={() => console.log('onPlay')}
          // other props here
        />
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag &apos;n&apos; drop some files here, or click to select files</p>
          )}
        </div>
      </article>

      <article className={styles.playlist}>
        <section>
          {playList.map((song, idx) => (
            <li key={song.name} onClick={() => playSong(idx)} aria-hidden="true">
              {song.name}
            </li>
          ))}
        </section>
      </article>
    </main>
  );
};

export default Player;
