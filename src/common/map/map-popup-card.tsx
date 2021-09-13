import React from 'react';
interface MapSlideProps {
    children:JSX.Element
}

interface MapSlideState {
    tweet:{},
    ready:Boolean
}

class MapSlide extends React.Component<MapSlideProps,MapSlideState> {

    render() {
        return (
            <div style={{
                position: 'absolute', 
                height: '90%',
                minWidth:'30%',
                right: 0, 
                top: '10%', float: 'right', opacity: 0.9,zIndex:10, overflow:'auto'
            }}>
                    {
                        this.props.children
                    }
            </div>
        );
    }
}
export default MapSlide;
