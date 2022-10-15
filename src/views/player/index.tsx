/* eslint-disable no-param-reassign */
import { useState, useCallback } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import { useDropzone } from 'react-dropzone';
import { parseBlob } from 'music-metadata-browser';
import styles from './Player.module.scss';
import 'react-h5-audio-player/lib/styles.css';

interface ISongMetaData {
  src: string;
  artist: string;
  album: string;
  title: string;
  year: number | null;
  image: string;
}

const Player = () => {
  const [playList, setPlayList] = useState<ISongMetaData[] | null>(null);
  const [playingSongData, setPlayingSongData] = useState<ISongMetaData>();

  console.log(playingSongData);
  console.log(playList);

  const imageСonverter = (img: Buffer) => {
    const typedArray = new Uint8Array(img);
    const stringChar = typedArray.reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ''
    );
    const base64String = btoa(stringChar);
    return `data:image/jpg;base64, ${base64String}`;
  };

  const downloadPlayList = (localFiles: File[]) => {
    const filesList = [...localFiles];
    const audioMetaDataPromise = Promise.all(
      filesList.map((fileToParse) => parseBlob(fileToParse))
    );

    audioMetaDataPromise.then((audioMetaDataArray) => {
      const metaData = audioMetaDataArray.map((tags, idx) => ({
        src: URL.createObjectURL(filesList[idx]),
        artist: tags.common.artist ?? 'Unknown',
        album: tags.common.album ?? '',
        title: tags.common.title ?? 'Unknown',
        year: tags.common.year ?? null,
        image: tags.common.picture ? imageСonverter(tags.common.picture[0].data) : '',
      }));

      setPlayList((prev) => (prev ? [...prev, ...metaData] : [...metaData]));
    });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    downloadPlayList(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const playSong = (song: ISongMetaData) => {
    setPlayingSongData(song);
  };

  return (
    <main className={styles.main}>
      <article className={styles.playerWrap}>
        <img src={playingSongData?.image} alt="alt" />
        <AudioPlayer
          className={styles.player}
          autoPlay
          src={playingSongData?.src}
          onPlay={() => console.log('onPlay')}
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
          {playList &&
            playList.map((song) => (
              <li
                key={`${song.artist}-${song.title}`}
                onClick={() => playSong(song)}
                aria-hidden="true"
              >
                {`${song.artist} - ${song.title}`}
              </li>
            ))}
        </section>
      </article>
    </main>
  );
};

export default Player;
