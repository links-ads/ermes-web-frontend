import React, { memo } from 'react'
// Badly pasted from https://nivo.rocks/pie
import { ResponsivePie } from '@nivo/pie'
// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const defaultData = [
  {
    id: 'stylus',
    label: 'stylus',
    value: 498,
    color: 'hsl(149, 70%, 50%)'
  },
  {
    id: 'php',
    label: 'php',
    value: 438,
    color: 'hsl(250, 70%, 50%)'
  },
  {
    id: 'lisp',
    label: 'lisp',
    value: 487,
    color: 'hsl(319, 70%, 50%)'
  },
  {
    id: 'rust',
    label: 'rust',
    value: 290,
    color: 'hsl(263, 70%, 50%)'
  },
  {
    id: 'sass',
    label: 'sass',
    value: 508,
    color: 'hsl(172, 70%, 50%)'
  }
]
function PieChart({ data = defaultData /* see data tab */ }) {
  return (
    <ResponsivePie
      data={data}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      colors={{ scheme: 'nivo' }}
      borderWidth={1}
      borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
      // radialLabelsSkipAngle={10}
      // radialLabelsTextXOffset={6}
      // radialLabelsTextColor="#333333"
      // radialLabelsLinkOffset={0}
      // radialLabelsLinkDiagonalLength={16}
      // radialLabelsLinkHorizontalLength={24}
      // radialLabelsLinkStrokeWidth={1}
      // radialLabelsLinkColor={{ from: 'color' }}
      // slicesLabelsSkipAngle={10}
      // slicesLabelsTextColor="#333333"
      // animate={true}
      // motionStiffness={90}
      // motionDamping={15}
      defs={[
        {
          id: 'dots',
          type: 'patternDots',
          background: 'inherit',
          color: 'rgba(255, 255, 255, 0.3)',
          size: 4,
          padding: 1,
          stagger: true
        },
        {
          id: 'lines',
          type: 'patternLines',
          background: 'inherit',
          color: 'rgba(255, 255, 255, 0.3)',
          rotation: -45,
          lineWidth: 6,
          spacing: 10
        }
      ]}
      fill={[
        {
          match: {
            id: 'ruby'
          },
          id: 'dots'
        },
        {
          match: {
            id: 'c'
          },
          id: 'dots'
        },
        {
          match: {
            id: 'go'
          },
          id: 'dots'
        },
        {
          match: {
            id: 'python'
          },
          id: 'dots'
        },
        {
          match: {
            id: 'scala'
          },
          id: 'lines'
        },
        {
          match: {
            id: 'lisp'
          },
          id: 'lines'
        },
        {
          match: {
            id: 'elixir'
          },
          id: 'lines'
        },
        {
          match: {
            id: 'javascript'
          },
          id: 'lines'
        }
      ]}
      legends={[
        {
          anchor: 'bottom',
          direction: 'row',
          translateY: 56,
          itemWidth: 100,
          itemHeight: 18,
          itemTextColor: '#999',
          symbolSize: 18,
          symbolShape: 'circle',
          effects: [
            {
              on: 'hover',
              style: {
                itemTextColor: '#000'
              }
            }
          ]
        }
      ]}
    />
  )
}
export const PieWidget = memo(function PieWidgetInner({ wid }: { wid: string }) {
  return (
    <div
      data-wid={wid}
      style={{
        width: '100%',
        height: '100%'
      }}
    >
      <PieChart />
    </div>
  )
})
