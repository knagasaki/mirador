import { compose } from 'redux';
import { connect } from 'react-redux';
import flatten from 'lodash/flatten';
import { withStyles } from '@material-ui/core/styles';
import * as actions from '../state/actions';
import { GalleryViewThumbnail } from '../components/GalleryViewThumbnail';
import {
  getSearchAnnotationsForWindow,
  getCurrentCanvas,
  getConfig,
  getAnnotations,
  getPresentAnnotationsOnSelectedCanvases,
  getCompanionWindowsForContent,
} from '../state/selectors';

/**
 * Styles to be passed to the withStyles HOC
 */
const styles = theme => ({
  annotationIcon: {
    height: '1rem',
    width: '1rem',
  },
  annotationsChip: {
    ...theme.typography.caption,
    left: '50%',
    position: 'absolute',
    top: 10,
    transform: 'translate(-50%, 0)',
  },
  avatar: {
    backgroundColor: 'transparent',
  },
  galleryViewItem: {
    '&$hasAnnotations': {
      border: `2px solid ${theme.palette.action.selected}`,
    },
    '&$selected,&$selected$hasAnnotations': {
      border: `2px solid ${theme.palette.primary.main}`,
    },
    '&:focus': {
      outline: 'none',
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    border: '2px solid transparent',
    cursor: 'pointer',
    display: 'inline-block',
    margin: `${theme.spacing(1)}px ${theme.spacing(0.5)}px`,
    maxHeight: props => props.config.height + 45,
    minWidth: '60px',
    overflow: 'hidden',
    padding: theme.spacing(0.5),
    position: 'relative',
    width: 'min-content',
  },
  hasAnnotations: {},
  searchChip: {
    ...theme.typography.caption,
    '&$selected $avatar': {
      backgroundColor: theme.palette.highlights.primary,
    },
    left: '50%',
    position: 'absolute',
    top: 80,
    transform: 'translate(-50%, 0)',
  },
  selected: {},
});

/** */
const mapStateToProps = (state, { canvas, windowId }) => {
  const currentCanvas = getCurrentCanvas(state, { windowId });
  const searchAnnotations = getSearchAnnotationsForWindow(
    state,
    { windowId },
  );

  const canvasAnnotations = flatten(searchAnnotations.map(a => a.resources))
    .filter(a => a.targetId === canvas.id);

  const hasOpenAnnotationsWindow = getCompanionWindowsForContent(state, { content: 'annotations', windowId }).length > 0;

  return {
    annotations: hasOpenAnnotationsWindow
      ? getAnnotations(state, { windowId })[canvas.id] || {}
      : {},
    annotationsCount: hasOpenAnnotationsWindow
      ? getPresentAnnotationsOnSelectedCanvases(
        state,
        { canvasId: canvas.id },
      ).reduce((v, a) => v + a.resources.filter(r => r.targetId === canvas.id).length, 0)
      : 0,
    config: getConfig(state).galleryView,
    searchAnnotationsCount: canvasAnnotations.length,
    selected: currentCanvas && currentCanvas.id === canvas.id,
  };
};

/**
 * mapDispatchToProps - used to hook up connect to action creators
 * @memberof WindowViewer
 * @private
 */
const mapDispatchToProps = (dispatch, { canvas, id, windowId }) => ({
  focusOnCanvas: () => dispatch(actions.setWindowViewType(windowId, 'single')),
  receiveAnnotation: (annotation) => (
    dispatch(actions.receiveAnnotation(canvas.id, annotation.id, annotation))
  ),
  requestAnnotation: (...args) => dispatch(actions.requestAnnotation(canvas.id, ...args)),
  setCanvas: (...args) => dispatch(actions.setCanvas(windowId, ...args)),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
  // further HOC go here
);

export default enhance(GalleryViewThumbnail);
