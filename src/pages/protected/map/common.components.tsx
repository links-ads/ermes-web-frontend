import styled from 'styled-components'
import { SizeAwareContainer } from '../../../common/size-aware-container.component'
//line 6 was 104
export const MapContainer = styled(SizeAwareContainer).attrs({ className: 'map-container' })`
  width: 100%;
  height: 100%;
  flex-grow: 1;
  position: relative;

  .controls-container {
    position: absolute;
    right: 0;
    margin: 10px;
    background: ${(props) => props.theme.palette.background.paper};
    border-radius: 12px;
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
  .mapboxgl-ctrl-popupfilter {
    background: ${(props) => props.theme.palette.background.paper} !important;
  }

  @media screen and (min-width: 298px) {
    top: 309px;
  }
  @media screen and (min-width: 320px) {
    top: 269px;
  }
  @media screen and (min-width: 365px) {
    top: 229px;
  }
  @media screen and (min-width: 514px) {
    top: 181px;
  }
  @media screen and (min-width: 1075px) {
    top: 141px;
  }
  @media screen and (min-width: 1321px) {
    top: 83px;
  }
  @media screen and (min-width: 1566px) {
    top: 43px;
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
  // height: ${(props) => props.imgHeight}px;
  max-width: 100%;
  // max-height: 100%;
`
