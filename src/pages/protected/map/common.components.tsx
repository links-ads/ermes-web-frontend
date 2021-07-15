import styled from 'styled-components'
import { SizeAwareContainer } from '../../../common/size-aware-container.component'

export const MapContainer = styled(SizeAwareContainer).attrs({ className: 'map-container' })`
  width: 100%;
  height: 108%;
  flex-grow: 1;
  position: relative;

  .controls-contaniner {
    position: absolute;
    right: 0;
    margin: 10px;
  }

  .mapboxgl-popup {
    z-index: 9999;
  }

  .mapboxgl-popup-content {
    background: transparent;
    padding: 0%;

    a,
    a:visited {
      color: ${(props) => props.theme.palette.text.primary};
    }
  }

  .mapboxgl-popup-anchor-right {
    .mapboxgl-popup-tip {
      border-left-color: ${(props) => props.theme.palette.background.paper};
    }
  }

  .mapboxgl-popup-anchor-left {
    .mapboxgl-popup-tip {
      border-right-color: ${(props) => props.theme.palette.background.paper};
    }
  }
  .mapboxgl-popup-anchor-bottom,
  .mapboxgl-popup-anchor-bottom-right,
  .mapboxgl-popup-anchor-bottom-left {
    .mapboxgl-popup-tip {
      border-top-color: ${(props) => props.theme.palette.background.paper};
    }
  }

  .mapboxgl-popup-anchor-top,
  .mapboxgl-popup-anchor-top-right,
  .mapboxgl-popup-anchor-top-left {
    .mapboxgl-popup-tip {
      border-bottom-color: ${(props) => props.theme.palette.background.paper};
    }
  }

  /** Controls customization */
  .mapboxgl-ctrl.mapboxgl-ctrl-group {
    box-shadow: none;
    & button {
      background: ${(props) => props.theme.palette.background.paper};
      color: ${(props) => props.theme.palette.text.primary};
      border: 1px solid ${(props) => props.theme.palette.background.paper};
      border-radius: 100%;
      margin: 4px 0;

      &:focus {
        box-shadow: 0 0 2px 2px ${(props) => props.theme.palette.secondary.light};
      }

      &.mapboxgl-ctrl-zoom-in {
        span.mapboxgl-ctrl-icon {
          &::after {
            content: 'add';
          }
        }
      }

      &.mapboxgl-ctrl-zoom-out {
        span.mapboxgl-ctrl-icon {
          &::after {
            content: 'remove';
          }
        }
      }

      &.mapboxgl-ctrl-compass {
        transform: rotateZ(-45deg);
        span.mapboxgl-ctrl-icon {
          &::after {
            content: 'explore';
          }
        }
      }

      &.mapboxgl-ctrl-geolocate {
        span.mapboxgl-ctrl-icon {
          &::after {
            content: 'my_location';
          }
        }
      }

      span.mapboxgl-ctrl-icon {
        background-image: none;
        position: relative;

        font-family: 'Material Icons';

        &::after {
          font-size: 18px;
          line-height: 28px;
        }
      }
    }
    background: transparent;
  }

  .mapboxgl-ctrl-icon.mapboxgl-ctrl-geolocate {
    &.mapboxgl-ctrl-geolocate-active {
      color: ${(props) => props.theme.palette.secondary.main};
    }
  }
`

interface ImgContainerProps {
  imageUrl: string
  imgWidth: number
  imgHeight: number
}

export const ImageContainer = styled.div<ImgContainerProps>`
  background-image: url(${(props) => props.imageUrl});
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  width: ${(props) => props.imgWidth}px;
  height: ${(props) => props.imgHeight}px;
  max-width: 100%;
  max-height: 100%;
`
