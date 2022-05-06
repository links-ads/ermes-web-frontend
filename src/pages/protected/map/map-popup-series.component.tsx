import React, { useState } from 'react'
import { Card, makeStyles, AppBar, Typography, IconButton, CardContent, useTheme, Box, Toolbar } from '@material-ui/core'
import FloatingCardContainer from '../../../common/floating-filters-tab/floating-card-container.component'
import CloseIcon from '@material-ui/icons/Close'
import { LineChartWidget } from '../dashboard/line-chart-widge.component'

const useStyles = makeStyles((theme) => ({
    titleContainer: {
        width: '90%',
        paddingTop: 11,
        paddingBottom: 11,
    },
    titleTooltip: {
        width: '10%',
        paddingTop: 11,
        paddingBottom: 11,

    }
}))

export default function MapTimeSeries(props) {
    const theme = useTheme()

    const [dim, setDim] = useState({
        width: 500,
        height: 400
    })
    const onResize = (event, data) => {
        setDim({ height: data.size.height, width: data.size.width })
    }
    const { dblClickFeatures, setDblClickFeatures } = props
    return (
        <>
            <FloatingCardContainer
                bounds={'parent'}
                defaultPosition={{ x: 90, y: 90 }}
                toggleActiveFilterTab={dblClickFeatures !== null}
                dim={dim}
                onResize={onResize}
                resizable={true}
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
                        <Toolbar>
                            <Box sx={{ flexGrow: 9 }}>
                                <Typography variant='caption'>
                                    {dblClickFeatures.layer}
                                </Typography>
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                                <IconButton
                                    onClick={() => {
                                        setDblClickFeatures(null)
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        </Toolbar>
                    </AppBar>
                    <CardContent style={{ height: '90%', overflowY: 'scroll' }}>
                        <LineChartWidget
                            data={dblClickFeatures.data}
                        />
                    </CardContent>
                </Card>
            </FloatingCardContainer>
        </>
    )
}