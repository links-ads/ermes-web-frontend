import React, { memo } from 'react'
import Typography from '@material-ui/core/Typography'
import * as z from 'zebras'
import { default as moment } from 'moment'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import { getRandomBackgroundAndTextColors } from '../../../../utils/color.utils'

export const TestWidget = memo(
  function TestWidgetInner({ wid }: { wid?: string }) {
    // Provisional
    const sampleData = {
      volunteer: ['Mario Rossi', 'Felipe Verdi', 'Antonio Bianchi', 'Carlo Neri'],
      status: ['Operational', 'Stand-by', 'Not Active', 'Operational'],
      lastUpdate: [
        moment(),
        moment().subtract(30, 'minutes'),
        moment().subtract(1, 'days'),
        moment().subtract(2, 'minutes')
      ],
      activeMissions: [2, 1, 0, 1]
    }

    // Better load fro CSV anyway!
    // Dataframe is a simple array of objects so the following is basically useless
    // but if z is used for stats then it is very useful for data visualization
    // in both tables and charts
    const rows = []
    // Object.keys(sampleData).reduce(
    //   (data, col) => z.addCol(col, sampleData[col], data),
    //   Object.keys(sampleData).map(() => ({}))
    // ) as Array<{
    //   volunteer: string
    //   status: string
    //   lastUpdate: moment.Moment
    //   activeMissions: number
    // }>

    return (
      <div
        data-wid={wid}
        style={{
          width: '100%',
          height: '100%',
          // backgroundColor: bg,
          // color,
          fontSize: '0.8em',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column'
        }}
      >
        <TableContainer component={Paper}>
          <Table aria-label="test table">
            <TableHead>
              <TableRow>
                <TableCell>Volunteer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Last Update</TableCell>
                <TableCell align="center">Active Missions</TableCell>
              </TableRow>
            </TableHead>
            {/* <TableBody>
              {rows.map((row, i) => (
                <TableRow key={i}>
                  <TableCell component="th" scope="row">
                    {row.volunteer}
                  </TableCell>
                  <TableCell align="left">{row.status}</TableCell>
                  <TableCell align="right">{row.lastUpdate.fromNow()}</TableCell>
                  <TableCell align="center">{row.activeMissions}</TableCell>
                </TableRow>
              ))}
            </TableBody> */}
          </Table>
        </TableContainer>
        {/* <Typography variant="h6">TEST WIDGET {wid}</Typography> */}
      </div>
    )
  },
  ({ wid }, { wid: oldWid }) => wid === oldWid
)

export const EmptyWidget = memo(
  function EmptyWidgetInner({ text, wid }: { text: string; wid: string }) {
    // Provisional
    const { textColor, backgroundColor } = getRandomBackgroundAndTextColors(wid)

    return (
      <div
        data-wid={wid}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor,
          color: textColor,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column'
        }}
      >
        <Typography variant="h6">Empty {text}</Typography>
      </div>
    )
  },
  ({ wid }, { wid: oldWid }) => wid === oldWid
)
