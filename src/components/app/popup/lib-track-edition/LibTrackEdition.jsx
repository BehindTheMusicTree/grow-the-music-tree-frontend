import styles from './LibTrackEdition.module.css'
import PropTypes from 'prop-types';
import ApiService from '../../../../service/apiService';
import { useForm } from 'react-hook-form';
import { formatTime } from '../../../../utils';

export default function LibTrackEdition ({ libTrack, onClose, handleUpdatedLibTrack }) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      title: libTrack.title,
      artistName: libTrack.artist ? libTrack.artist.name : '',
      genreName: libTrack.genre ? libTrack.genre.name : '',
      albumName: libTrack.album ? libTrack.album.name : ''
    }
  });

  const onSubmit = async (data) => {
    const response = await ApiService.putLibTrack(libTrack.uuid, data);
    handleUpdatedLibTrack(response);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.trackEdition}>
          <h2 className={styles.title}>Edit Track</h2>
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.column}>
              <label className={styles.label}>
                <span>Title:</span>
                <input className={styles.input} type="text" {...register('title')} />
              </label>
              <label className={styles.label}>
                <span>Artist:</span>
                <input className={styles.input} type="text" {...register('artistName')} />
              </label>
              <label className={styles.label}>
                <span>Genre:</span>
                <input className={styles.input} type="text" {...register('genreName')} />
              </label>
            </div>
            <div className={styles.column}>
              <label className={styles.label}>
                <span>Duration:</span>
                <div className={styles.readOnlyInput}>{formatTime(libTrack.duration)}</div>
              </label>
              <label className={styles.label}>
                <span>Album:</span>
                <input className={styles.input} type="text" {...register('albumName')} />
              </label>
            </div>
            <button className={styles.button} type="submit">Save</button>
          </form>
        </div>
      </div>
    </div>
  );
}

LibTrackEdition.propTypes = {
  libTrack: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  handleUpdatedLibTrack: PropTypes.func.isRequired
};