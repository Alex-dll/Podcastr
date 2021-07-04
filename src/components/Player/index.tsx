import { useRef, useEffect, useState } from 'react'

import { usePlayer } from '../../contexts/PlayerContext'

import styles from './styles.module.scss'

import Image from 'next/image'

import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

import shuffle from '../../../public/shuffle.svg'
import playPreviousImg from '../../../public/play-previous.svg'
import play from '../../../public/play.svg'
import pause from '../../../public/pause.svg'
import playNextImg from '../../../public/play-next.svg'
import repeat from '../../../public/repeat.svg'
import playing from '../../../public/playing.svg'
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString'

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0)

  const { 
    episodeList, 
    currentEpisodeIndex, 
    isPlaying,
    isLooping,
    isShuffling,
    togglePlay,
    toggleLoop,
    toggleShuffle, 
    setPlayState,
    clearPlayerState,
    playNext,
    playPrevious,
    hasNext,
    hasPrevious,
  } = usePlayer()

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying])

  function setupProgressListener() {
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener('timeupdate', () => {
      setProgress(Math.floor(audioRef.current.currentTime));
    });
  }

  function handleSeek(amount: number) {
    audioRef.current.currentTime = amount;
    setProgress(amount);
  }

  function handleEpisodeEnded() {
    if (hasNext) {
      playNext()
    } else {
      clearPlayerState()
    }
  }

  const episode = episodeList[currentEpisodeIndex]

  return(
    <div className={styles.playerContainer}>
      <header>
        <Image src={playing} alt="Tocando agora"/>
        <strong>Tocando agora</strong>
      </header>

      { episode ? (
        <div className={styles.currentEpisode}>
          <Image 
          width={592} 
          height={592}
          src={episode.thumbnail}
          alt={episode.title}
          objectFit="cover"
           />
           <strong>{episode.title}</strong>
           <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}

      <footer className={!episode ? styles.empty : ''}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>
            <div className={styles.slider}>
              {episode ? (
                <Slider
                  max={episode.duration}
                  value={progress}
                  onChange={handleSeek}
                  trackStyle={{ backgroundColor: '#04d361' }}
                  railStyle={{backgroundColor: '#9f75ff'}}
                  handleStyle={{borderColor: '#04d361', borderWidth: 4}}
                />
              ) : (
              <div className={styles.emptySlider} />
              )}
            </div>
          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>

        {episode && (
          <audio 
          src={episode.url}
          ref={audioRef}
          autoPlay
          onEnded={handleEpisodeEnded}
          loop={isLooping}
          onPlay={() => setPlayState(true)}
          onPause={() => setPlayState(false)}
          onLoadedMetadata={setupProgressListener}
          />
        )}

        <div className={styles.buttons}>
          <button 
            type='button' 
            disabled={!episode || episodeList.length === 1}
            onClick={toggleShuffle}
            className={isShuffling ? styles.isActive : ''}
          >
            <Image src={shuffle} alt="Embaralhar"/>
          </button>
          <button type='button' disabled={!episode || !hasPrevious}>
            <Image
             src={playPreviousImg} 
             onClick={playPrevious} 
             alt="Tocar anterior"
             /> 
          </button>
          <button 
            type='button' 
            className={styles.playerButton} 
            disabled={!episode}
            onClick={togglePlay}
          >
            {isPlaying ? (
            <Image src={pause} alt="Tocar"/>
            ) : (
            <Image src={play} alt="Tocar"/>
            )}
          </button>
          <button type='button' disabled={!episode || !hasNext}>
            <Image src={playNextImg} onClick={playNext} alt="Tocar proxima"/>
          </button>
          <button
           type='button' 
           disabled={!episode}
           onClick={toggleLoop}
           className={isLooping ? styles.isActive : ''}
          >
            <Image src={repeat} alt="Repetir"/>
          </button>
        </div>
      </footer>
    </div>
  );
}
