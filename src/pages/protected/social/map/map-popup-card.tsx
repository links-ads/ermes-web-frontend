import React from 'react';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { Card, Typography } from '@material-ui/core';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

export const PopupCard = (props) => {
    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            header: {
                margin: '6px',
                padding: 0
            },
            content: {
                padding: 5,
                "&:last-child": {
                    paddingBottom: 0
                }
            }
        }));

    const classes = useStyles();

    return (
        // <StyledPopup>
        <Card
            elevation={0}
            style={{
                width: '10vw', height: '10vh', textOverflow: "ellipsis",
                overflow: "hidden"
            }}>
            <CardHeader className={classes.header}
                title={(<Typography color='secondary' variant='caption' display='inline'>
                    {'@' + props.features['author_user_name']}
                </Typography>)}
            />
            <CardContent className={classes.content}>
                <Typography variant='subtitle2' display='inline'>
                    {props.features['text'].substring(0, 30) + ' ...'}
                </Typography>
            </CardContent>
        </Card>
        // </StyledPopup>
    );

}

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
                position: 'absolute', width: '30%', height: '90%',
                left: '70%', top: '10%', float: 'right', opacity: 0.9,zIndex:10, overflow:'auto'
            }}>
                    {
                        this.props.children
                    }
            </div>
        );
    }
}
export default MapSlide;
