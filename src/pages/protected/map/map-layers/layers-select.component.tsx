import React, { useState } from 'react';
import Draggable from 'react-draggable'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    AppBar,
    Card,
    CircularProgress,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    makeStyles,
    Radio,
    RadioGroup,
    Typography,
    useTheme
} from '@material-ui/core'
import { ResizableBox } from 'react-resizable';
import CloseIcon from '@material-ui/icons/Close';
import CardContent from '@material-ui/core/CardContent'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { useTranslation } from 'react-i18next';

export const NO_LAYER_SELECTED = "-1"


const useStyles = makeStyles((theme) => ({
    floatingSelect: {
        position: 'absolute',
        zIndex: 9
    },
    titleContainer: {
        width: '100px',
        display: 'inline-block',
        paddingLeft: 32,
        paddingTop: 11,
        paddingBottom: 11,
        marginRight: 32
    },
    resizable: {
        position: 'relative',
        '& .react-resizable-handle': {
            position: 'absolute',
            width: 20,
            height: 20,
            bottom: 0,
            right: 0,
            background:
                "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2IDYiIHN0eWxlPSJiYWNrZ3JvdW5kLWNvbG9yOiNmZmZmZmYwMCIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI2cHgiIGhlaWdodD0iNnB4Ij48ZyBvcGFjaXR5PSIwLjMwMiI+PHBhdGggZD0iTSA2IDYgTCAwIDYgTCAwIDQuMiBMIDQgNC4yIEwgNC4yIDQuMiBMIDQuMiAwIEwgNiAwIEwgNiA2IEwgNiA2IFoiIGZpbGw9IiMwMDAwMDAiLz48L2c+PC9zdmc+')",
            'background-position': 'bottom right',
            padding: '0 3px 3px 0',
            'background-repeat': 'no-repeat',
            'background-origin': 'content-box',
            'box-sizing': 'border-box',
            cursor: 'se-resize'
        }
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular
    },
    accordionDetails: {
        display: 'block'
    }
}))

export function LayersSelectContainer(props) {

    const classes = useStyles()
    const { t } = useTranslation(['maps'])
    const theme = useTheme()
    const [dim, setDim] = useState({
        width: 500,
        height: 400
    })
    const [expanded, setExpanded] = React.useState<string>("")


    const onResize = (event, data) => {
        setDim({ height: data.size.height, width: data.size.width })
    }

    const handleAccordionChange =
        (panel: string, type: "main" | "sub") => (event: React.ChangeEvent<{}>, newExpanded: boolean) => {
            if (type === 'main')
                setExpanded(expanded.split("_")[0] === panel ? "" : panel)
            else {
                const accordionOpens = expanded.split("_")
                const isSubOpen = accordionOpens.length > 1
                setExpanded(!isSubOpen ? accordionOpens[0] + "_" + panel : accordionOpens[1] === panel ? accordionOpens[0] : accordionOpens[0] + "_" + panel)
            }
        }

    const handleRadioClick = (event:any) => {
        if (event.target.value === props.selectedLayerId) {
            props.setSelectedLayerId(NO_LAYER_SELECTED);
          } else {
            props.setSelectedLayerId(event.target.value);
          }
    }
    return (
        <>
            <Draggable
                axis="both"
                handle=".handle"
                bounds='parent'
                defaultPosition={{ x: 60, y: 60 }}
                position={undefined}
                scale={1}
                onStart={(e) => e.preventDefault()}
                onDrag={(e) => e.preventDefault()}
                onStop={(e) => e.preventDefault()}
            >
                <div
                    style={{ display: props.visibility ? undefined : 'none' }}
                    className={classes.floatingSelect}
                >
                    <ResizableBox
                        height={dim.height}
                        width={dim.width}
                        onResize={onResize}
                        className={classes.resizable}
                        minConstraints={[500, 300]}
                        maxConstraints={[1000, 800]}
                    >
                        <Card style={{ height: dim.height }}>
                            <AppBar
                                position="static"
                                color="default"
                                style={{
                                    backgroundColor: theme.palette.primary.dark,
                                    boxShadow: 'none',
                                    display: 'block'
                                }}
                                className="handle handleResize"
                            >
                                <span className={classes.titleContainer}>
                                    <Typography align="left" variant="h4">
                                        Layers
                                    </Typography>
                                </span>
                                <span>
                                    <IconButton
                                        style={{ marginTop: '10px', position: 'absolute', right: '10px' }}
                                        onClick={() => {
                                            setExpanded("")
                                            props.setVisibility(false)
                                        }}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </span>
                            </AppBar>
                            <CardContent style={{ height: '90%', overflowY: "auto" }}>
                            {props.loading ? (<Grid container justify='center'><CircularProgress /> </Grid>) :
                                    (props.data === undefined || !props.data['layerGroups'] || Object.entries(props.data['layerGroups']).length === 0) ?
                                        (<Grid container justify='center'><Typography align="center" variant="h6">{t("maps:no_layers")}</Typography></Grid>) :
                                (<FormControl component="fieldset">
                                    <RadioGroup
                                        aria-label="gender"
                                        name="controlled-radio-buttons-group"
                                        value={props.selectedLayerId}
                                    >
                                             {props.data['layerGroups'].map(group => {
                                                return (
                                                    <Accordion
                                                        key={group['groupKey']}
                                                        color="primary"
                                                        style={{ backgroundColor: theme.palette.primary.dark, width: '100%' }}
                                                        expanded={expanded.split("_")[0] === group['groupKey']}
                                                        onChange={handleAccordionChange(group['groupKey'], 'main')}
                                                    >
                                                        <AccordionSummary
                                                            expandIcon={<ExpandMoreIcon />}
                                                            id={group['groupKey']}
                                                        >
                                                            <Typography className={classes.heading}>
                                                                {group['group']}
                                                            </Typography>
                                                        </AccordionSummary>
                                                        <AccordionDetails className={classes.accordionDetails}>
                                                            {
                                                                group['subGroups'].map(subGroup => {
                                                                    const layers = subGroup['layers'].map((layer, i) => (<FormControlLabel key={layer['dataTypeId']} value={String(layer['dataTypeId'])} control={<Radio onClick={handleRadioClick} />} label={layer['name']} /> ))
                                                                    return subGroup['subGroupKey'] !== null ? (
                                                                        <Accordion
                                                                            key={subGroup['subGroupKey']}
                                                                            color="primary"
                                                                            style={{ backgroundColor: theme.palette.primary.dark, width: '100%' }}
                                                                            expanded={expanded.split("_")[1] === subGroup['subGroupKey']}
                                                                            onChange={handleAccordionChange(subGroup['subGroupKey'], 'sub')}
                                                                        >
                                                                            <AccordionSummary
                                                                                expandIcon={<ExpandMoreIcon />}
                                                                                id={subGroup['subGroupKey']}
                                                                            >
                                                                                <Typography className={classes.heading}>
                                                                                    {subGroup['subGroup']}
                                                                                </Typography>
                                                                            </AccordionSummary>
                                                                            <AccordionDetails className={classes.accordionDetails}>
                                                                                {layers}
                                                                            </AccordionDetails>
                                                                        </Accordion>
                                                                    ) : layers
                                                                })
                                                            }
                                                        </AccordionDetails>
                                                    </Accordion>
                                                )
                                            })}
                                    </RadioGroup>
                                </FormControl>)}
                            </CardContent>
                        </Card>
                    </ResizableBox>
                </div>
            </Draggable>
        </>
    )

}