import React, { useContext, useState, useEffect } from 'react'
import { Group } from '@visx/group'
import { BarGroup, BarStack } from '@visx/shape'
import { Text } from '@visx/text'
import chroma from 'chroma-js'
import ErrorBoundary from '@cdc/core/components/ErrorBoundary'
import Context from '../context'
import ReactTooltip from 'react-tooltip'
import { BarStackHorizontal } from '@visx/shape'

export default function BarChart({ xScale, yScale, seriesScale, xMax, yMax, getXAxisData, getYAxisData, animatedChart, visible }) {
  const { transformedData: data, colorScale, seriesHighlight, config, formatNumber, updateConfig, setParentConfig, colorPalettes, formatDate, parseDate } = useContext<any>(Context)
  const { orientation, visualizationSubType } = config
  const isHorizontal = orientation === 'horizontal'

  const lollipopBarWidth = config.lollipopSize === 'large' ? 7 : config.lollipopSize === 'medium' ? 6 : 5
  const lollipopShapeSize = config.lollipopSize === 'large' ? 14 : config.lollipopSize === 'medium' ? 12 : 10

  const isLabelBelowBar = config.yAxis.labelPlacement === 'Below Bar'
  const isLabelOnYAxis = config.yAxis.labelPlacement === 'On Date/Category Axis'
  const isLabelOnBar = config.yAxis.labelPlacement === 'On Bar'
  const isLabelMissing = !config.yAxis.labelPlacement
  const displayNumbersOnBar = config.yAxis.displayNumbersOnBar
  const section = config.orientation === 'horizontal' ? 'yAxis' : 'xAxis'

  const isRounded = config.barStyle === 'rounded'
  const isStacked = config.visualizationSubType === 'stacked'
  const tipRounding = config.tipRounding
  const radius = config.roundingStyle === 'standard' ? '8px' : config.roundingStyle === 'shallow' ? '5px' : config.roundingStyle === 'finger' ? '15px' : '0px'
  const stackCount = config.runtime.seriesKeys.length
  const barBorderWidth = 1
  const fontSize = { small: 14, medium: 16, large: 18 }

  const applyRadius = (index: number) => {
    if (index === undefined || index === null || !isRounded) return
    let style = {}

    if ((isStacked && index + 1 === stackCount) || !isStacked) {
      style = isHorizontal ? { borderRadius: `0 ${radius}  ${radius}  0` } : { borderRadius: `${radius} ${radius} 0 0` }
    }
    if (tipRounding === 'full' && isStacked && index === 0 && stackCount > 1) {
      style = isHorizontal ? { borderRadius: `${radius} 0 0 ${radius}` } : { borderRadius: `0 0 ${radius} ${radius}` }
    }
    if (tipRounding === 'full' && ((isStacked && index === 0 && stackCount === 1) || !isStacked)) {
      style = { borderRadius: radius }
    }

    return style
  }

  const updateBars = defaultBars => {
    // function updates  stacked && regular && lollipop horizontal bars
    if (config.visualizationType !== 'Bar' && !isHorizontal) return defaultBars

    const barsArr = [...defaultBars]
    let barHeight = !isStacked ? config.barHeight * stackCount : config.barHeight
    !isStacked && config.isLollipopChart ? (barHeight = lollipopBarWidth) : barHeight

    const labelHeight = isLabelBelowBar ? fontSize[config.fontSize || 'medium'] : 0
    let barSpace = isLabelBelowBar ? barHeight / 2 : Number(config.barSpace)

    if (config.isLollipopChart && isLabelBelowBar && !isStacked) {
      barSpace = 20 // 20 is hard coded space.
    }
    // calculate height of container based height, space and fontSize of labels
    let totalHeight = barsArr.length * (barHeight + labelHeight + barSpace)

    if (isHorizontal) {
      config.height = totalHeight
    }

    // return new updated bars/groupes
    return barsArr.map((bar, i) => {
      // set bars Y dynamycly to handle space between bars
      let y = 0
      bar.index !== 0 && (y = (barHeight + barSpace + labelHeight) * i)

      return { ...bar, y: y, height: barHeight }
    })
  }

  function getTextWidth(text, font) {
    // function calculates the width of given text and its font-size
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    context.font = font || getComputedStyle(document.body).font

    return Math.ceil(context.measureText(text).width)
  }

  // Using State
  const [horizBarHeight, setHorizBarHeight] = useState(null)
  const [textWidth, setTextWidth] = useState(null)

  useEffect(() => {
    if (orientation === 'horizontal' && !config.yAxis.labelPlacement) {
      updateConfig({
        ...config,
        yAxis: {
          ...config,
          labelPlacement: 'Below Bar'
        }
      })
    }
  }, [config, updateConfig])

  useEffect(() => {
    if (config.isLollipopChart === false && config.barHeight < 25) {
      updateConfig({ ...config, barHeight: 25 })
    }
  }, [config.isLollipopChart])

  useEffect(() => {
    if (config.visualizationSubType === 'horizontal') {
      updateConfig({
        ...config,
        orientation: 'horizontal'
      })
    }
  }, [])

  useEffect(() => {
    if (config.barStyle === 'lollipop' && !config.isLollipopChart) {
      updateConfig({ ...config, isLollipopChart: true })
    }
    if (isRounded || config.barStyle === 'flat') {
      updateConfig({ ...config, isLollipopChart: false })
    }
  }, [config.barStyle])

  return (
    <ErrorBoundary component='BarChart'>
      <Group left={config.runtime.yAxis.size}>
        {/* Stacked Vertical */}
        {config.visualizationSubType === 'stacked' && !isHorizontal && (
          <BarStack data={data} keys={config.runtime.barSeriesKeys || config.runtime.seriesKeys} x={(d: any) => d[config.runtime.xAxis.dataKey]} xScale={xScale} yScale={yScale} color={colorScale}>
            {barStacks =>
              barStacks.reverse().map(barStack =>
                barStack.bars.map(bar => {
                  const xAxisValue = config.runtime.xAxis.type === 'date' ? formatDate(parseDate(data[bar.index][config.runtime.xAxis.dataKey])) : data[bar.index][config.runtime.xAxis.dataKey]
                  const yAxisValue = formatNumber(bar.bar ? bar.bar.data[bar.key] : 0)
                  let yAxisTooltip = config.runtime.yAxis.isLegendValue ? `${bar.key}: ${yAxisValue}` : config.runtime.yAxis.label ? `${config.runtime.yAxis.label}: ${yAxisValue}` : yAxisValue
                  let xAxisTooltip = config.runtime.xAxis.label ? `${config.runtime.xAxis.label}: ${xAxisValue}` : xAxisValue

                  const tooltip = `<div>
                    ${yAxisTooltip}<br />
                    ${xAxisTooltip}<br />
                    ${config.seriesLabel ? `${config.seriesLabel}: ${bar.key}` : ''}`

                  let transparentBar = config.legend.behavior === 'highlight' && seriesHighlight.length > 0 && seriesHighlight.indexOf(bar.key) === -1
                  let displayBar = config.legend.behavior === 'highlight' || seriesHighlight.length === 0 || seriesHighlight.indexOf(bar.key) !== -1
                  let barThickness = xMax / barStack.bars.length
                  let barThicknessAdjusted = barThickness * (config.barThickness || 0.8)
                  let offset = (barThickness * (1 - (config.barThickness || 0.8))) / 2
                  const style = applyRadius(barStack.index)

                  return (
                    <>
                      <style>
                        {`
                         #barStack${barStack.index}-${bar.index} rect,
                         #barStack${barStack.index}-${bar.index} foreignObject{
                          animation-delay: ${barStack.index}.2s;
                          transform-origin: ${barThicknessAdjusted / 2}px ${bar.y + bar.height}px
                        }
                      `}
                      </style>
                      <Group key={`bar-stack-${barStack.index}-${bar.index}`} id={`barStack${barStack.index}-${bar.index}`} className='stack vertical'>
                        <Text display={config.labels && displayBar ? 'block' : 'none'} opacity={transparentBar ? 0.5 : 1} x={barThickness * bar.index + offset} y={bar.y - 5} fill={bar.color} textAnchor='middle'>
                          {formatNumber(bar.bar ? bar.bar.data[bar.key] : 0)}
                        </Text>
                        <foreignObject
                          key={`bar-stack-${barStack.index}-${bar.index}`}
                          x={barThickness * bar.index + offset}
                          y={bar.y}
                          width={barThicknessAdjusted}
                          height={bar.height}
                          style={{ background: bar.color, border: `${config.barHasBorder === 'true' ? barBorderWidth : 0}px solid #333`, ...style }}
                          opacity={transparentBar ? 0.5 : 1}
                          display={displayBar ? 'block' : 'none'}
                          data-tip={tooltip}
                          data-for={`cdc-open-viz-tooltip-${config.runtime.uniqueId}`}
                        ></foreignObject>
                      </Group>
                    </>
                  )
                })
              )
            }
          </BarStack>
        )}

        {/* Stacked Horizontal */}
        {config.visualizationSubType === 'stacked' && isHorizontal && (
          <>
            <BarStackHorizontal data={data} keys={config.runtime.barSeriesKeys || config.runtime.seriesKeys} height={yMax} y={(d: any) => d[config.runtime.yAxis.dataKey]} xScale={xScale} yScale={yScale} color={colorScale} offset='none'>
              {barStacks =>
                barStacks.map(barStack =>
                  updateBars(barStack.bars).map((bar, index) => {
                    const yAxisValue = formatNumber(data[bar.index][bar.key])
                    const xAxisValue = config.runtime.yAxis.type === 'date' ? formatDate(parseDate(data[bar.index][config.runtime.originalXAxis.dataKey])) : data[bar.index][config.runtime.originalXAxis.dataKey]
                    let yAxisTooltip = config.yAxis.isLegendValue ? `${bar.key}: ${yAxisValue}` : config.yAxis.label ? `${config.yAxis.label}: ${yAxisValue}` : `${yAxisValue}`
                    let xAxisTooltip = config.xAxis.label ? `${config.xAxis.label}: ${xAxisValue}` : xAxisValue

                    const tooltip = `<div>
                    ${yAxisTooltip}<br />
                    ${xAxisTooltip}<br />
                    ${config.seriesLabel ? `${config.seriesLabel}: ${bar.key}` : ''}`
                    let transparentBar = config.legend.behavior === 'highlight' && seriesHighlight.length > 0 && seriesHighlight.indexOf(bar.key) === -1
                    let displayBar = config.legend.behavior === 'highlight' || seriesHighlight.length === 0 || seriesHighlight.indexOf(bar.key) !== -1
                    config.barHeight = Number(config.barHeight)
                    const style = applyRadius(barStack.index)

                    let labelColor = '#000000'

                    if (chroma.contrast(labelColor, bar.color) < 4.9) {
                      labelColor = '#FFFFFF'
                    }

                    return (
                      <Group key={index}>
                        <foreignObject
                          key={`barstack-horizontal-${barStack.index}-${bar.index}-${index}`}
                          className={`animated-chart group ${animatedChart ? 'animated' : ''}`}
                          x={bar.x}
                          y={bar.y}
                          width={bar.width}
                          height={bar.height}
                          style={{ background: bar.color, border: `${config.barHasBorder === 'true' ? barBorderWidth : 0}px solid #333`, ...style }}
                          opacity={transparentBar ? 0.5 : 1}
                          display={displayBar ? 'block' : 'none'}
                          data-tip={tooltip}
                          data-for={`cdc-open-viz-tooltip-${config.runtime.uniqueId}`}
                        ></foreignObject>

                        {orientation === 'horizontal' && visualizationSubType === 'stacked' && isLabelBelowBar && barStack.index === 0 && !config.yAxis.hideLabel && (
                          <Text
                            x={`${bar.x + (config.isLollipopChart ? 15 : 5)}`} // padding
                            y={bar.y + bar.height * 1.2}
                            fill={'#000000'}
                            textAnchor='start'
                            verticalAnchor='start'
                          >
                            {isHorizontal ? xAxisValue : formatNumber(xAxisValue)}
                          </Text>
                        )}

                        {displayNumbersOnBar && textWidth + 50 < bar.width && (
                          <Text
                            display={displayBar ? 'block' : 'none'}
                            x={bar.x + barStack.bars[bar.index].width / 2} // padding
                            y={bar.y + bar.height / 2}
                            fill={labelColor}
                            textAnchor='middle'
                            verticalAnchor='middle'
                            innerRef={e => {
                              if (e) {
                                // use font sizes and padding to set the bar height
                                let elem = e.getBBox()
                                setTextWidth(elem.width)
                              }
                            }}
                          >
                            {formatNumber(data[bar.index][bar.key])}
                          </Text>
                        )}
                      </Group>
                    )
                  })
                )
              }
            </BarStackHorizontal>
          </>
        )}

        {/* Bar Groups: Not Stacked */}
        {config.visualizationSubType !== 'stacked' && (
          <Group>
            <BarGroup
              data={data}
              keys={config.runtime.barSeriesKeys || config.runtime.seriesKeys}
              height={yMax}
              x0={(d: any) => d[config.runtime.originalXAxis.dataKey]}
              x0Scale={config.runtime.horizontal ? yScale : xScale}
              x1Scale={seriesScale}
              yScale={config.runtime.horizontal ? xScale : yScale}
              color={() => {
                return ''
              }}
            >
              {barGroups => {
                return updateBars(barGroups).map((barGroup, index) => (
                  <Group
                    className={`bar-group-${barGroup.index}-${barGroup.x0}--${index} ${config.orientation}`}
                    key={`bar-group-${barGroup.index}-${barGroup.x0}--${index}`}
                    top={config.runtime.horizontal ? barGroup.y : 0}
                    left={config.runtime.horizontal ? 0 : (xMax / barGroups.length) * barGroup.index}
                  >
                    {barGroup.bars.map((bar, index) => {
                      let transparentBar = config.legend.behavior === 'highlight' && seriesHighlight.length > 0 && seriesHighlight.indexOf(bar.key) === -1
                      let displayBar = config.legend.behavior === 'highlight' || seriesHighlight.length === 0 || seriesHighlight.indexOf(bar.key) !== -1
                      let barHeight = orientation === 'horizontal' ? config.barHeight : Math.abs(yScale(bar.value) - yScale(0))
                      let barY = bar.value >= 0 ? bar.y : yScale(0)
                      let barGroupWidth = ((config.runtime.horizontal ? yMax : xMax) / barGroups.length) * (config.barThickness || 0.8)
                      let offset = (((config.runtime.horizontal ? yMax : xMax) / barGroups.length) * (1 - (config.barThickness || 0.8))) / 2

                      // ! Unsure if this should go back.
                      if (config.isLollipopChart) {
                        offset = (config.runtime.horizontal ? yMax : xMax) / barGroups.length / 2 - lollipopBarWidth / 2
                      }
                      const set = new Set()
                      data.forEach(d => set.add(d[config.legend.colorCode]))
                      const uniqValues = Array.from(set)

                      let palette = colorPalettes[config.palette].slice(0, uniqValues.length)

                      let barWidth = config.isLollipopChart ? lollipopBarWidth : barGroupWidth / barGroup.bars.length
                      let barColor = config.runtime.seriesLabels && config.runtime.seriesLabels[bar.key] ? colorScale(config.runtime.seriesLabels[bar.key]) : colorScale(bar.key)
                      while (palette.length < barGroups.length) {
                        palette = palette.concat(palette)
                      }
                      if (config.legend.colorCode && config.series.length === 1) barColor = palette[barGroup.index]

                      let yAxisValue = formatNumber(bar.value)
                      let xAxisValue = config.runtime[section].type === 'date' ? formatDate(parseDate(data[barGroup.index][config.runtime.originalXAxis.dataKey])) : data[barGroup.index][config.runtime.originalXAxis.dataKey]

                      if (config.runtime.horizontal) {
                        let tempValue = yAxisValue
                        yAxisValue = xAxisValue
                        xAxisValue = tempValue
                        barWidth = config.barHeight
                      }

                      let yAxisTooltip = config.runtime.yAxis.isLegendValue ? `${bar.key} : ${yAxisValue}` : config.runtime.yAxis.label ? `${config.runtime.yAxis.label}: ${yAxisValue}` : yAxisValue
                      let xAxisTooltip = config.runtime.xAxis.isLegendValue ? ` ${bar.key} :${xAxisValue}` : config.runtime.xAxis.label ? `${config.runtime.xAxis.label}: ${xAxisValue}` : xAxisValue
                      let labelColor = '#000000'

                      // Set label color
                      if (chroma.contrast(labelColor, barColor) < 4.9) {
                        labelColor = '#FFFFFF'
                      }

                      const tooltip = `<div>
                    ${yAxisTooltip}<br />
                    ${xAxisTooltip}<br />
                    ${config.seriesLabel ? `${config.seriesLabel}: ${bar.key}` : ''}`
                      const style = applyRadius(index)

                      // check if bar text/value string fits into  each bars.
                      let textWidth = getTextWidth(xAxisValue, config.fontSize)
                      let doesTextFit = (textWidth / bar.y) * 100 < 48

                      return (
                        <>
                          {/* This feels gross but inline transition was not working well*/}
                          <style>
                            {`
                            .linear #barGroup${barGroup.index},
                            .Combo #barGroup${barGroup.index} {
                              transform-origin: 0 ${barY + barHeight}px;
                            }
                          `}
                          </style>
                          <Group key={`bar-sub-group-${barGroup.index}-${barGroup.x0}-${barY}--${index}`}>
                            <foreignObject
                              id={`barGroup${barGroup.index}`}
                              key={`bar-group-bar-${barGroup.index}-${bar.index}-${bar.value}-${bar.key}`}
                              x={config.runtime.horizontal ? 0 : barWidth * (barGroup.bars.length - bar.index - 1) + offset}
                              y={config.runtime.horizontal ? barWidth * (barGroup.bars.length - bar.index - 1) : barY}
                              width={config.runtime.horizontal ? bar.y : barWidth}
                              height={isHorizontal && !config.isLollipopChart ? barWidth : isHorizontal && config.isLollipopChart ? lollipopBarWidth : barHeight}
                              style={{
                                background: config.isLollipopChart && config.lollipopColorStyle === 'regular' ? barColor : config.isLollipopChart && config.lollipopColorStyle === 'two-tone' ? chroma(barColor).brighten(1) : barColor,
                                border: `${config.isLollipopChart ? 0 : config.barHasBorder === 'true' ? barBorderWidth : 0}px solid #333`,
                                ...style
                              }}
                              opacity={transparentBar ? 0.5 : 1}
                              display={displayBar ? 'block' : 'none'}
                              data-tip={tooltip}
                              data-for={`cdc-open-viz-tooltip-${config.runtime.uniqueId}`}
                            ></foreignObject>
                            {orientation === 'horizontal' && !config.isLollipopChart && displayNumbersOnBar && (
                              <Text
                                display={displayBar ? 'block' : 'none'}
                                x={bar.y}
                                y={config.barHeight / 2 + config.barHeight * (barGroup.bars.length - bar.index - 1)}
                                fill={labelColor}
                                dx={doesTextFit ? -5 : 5} // X padding
                                verticalAnchor='middle'
                                textAnchor={doesTextFit ? 'end' : 'start'}
                              >
                                {xAxisValue}
                              </Text>
                            )}
                            ;
                            {orientation === 'horizontal' && config.isLollipopChart && displayNumbersOnBar && (
                              <Text
                                display={displayBar ? 'block' : 'none'}
                                x={`${bar.y + (config.isLollipopChart ? 15 : 5) + (config.isLollipopChart && barGroup.bars.length === bar.index ? offset : 0)}`} // padding
                                y={0}
                                fill={'#000000'}
                                textAnchor='start'
                                verticalAnchor='middle'
                                fontWeight={'normal'}
                              >
                                {xAxisValue}
                              </Text>
                            )}
                            {orientation === 'horizontal' && isLabelBelowBar && !config.yAxis.hideLabel && (
                              <Text x={config.yAxis.hideAxis ? 0 : 5} y={barGroup.height} dy={4} verticalAnchor={'start'} textAnchor={'start'}>
                                {config.runtime.yAxis.type === 'date'
                                  ? formatDate(parseDate(data[barGroup.index][config.runtime.originalXAxis.dataKey]))
                                  : isHorizontal
                                  ? data[barGroup.index][config.runtime.originalXAxis.dataKey]
                                  : formatNumber(data[barGroup.index][config.runtime.originalXAxis.dataKey])}
                              </Text>
                            )}
                            ;
                            {orientation === 'vertical' && (
                              <Text display={config.labels && displayBar ? 'block' : 'none'} opacity={transparentBar ? 0.5 : 1} x={barWidth * (barGroup.bars.length - bar.index - 0.5) + offset} y={barY - 5} fill={barColor} textAnchor='middle'>
                                {bar.value}
                              </Text>
                            )}
                            ;
                            {config.isLollipopChart && config.lollipopShape === 'circle' && (
                              <circle
                                cx={orientation === 'horizontal' ? bar.y : barWidth * (barGroup.bars.length - bar.index - 1) + (isLabelBelowBar && orientation === 'horizontal' ? 0 : offset) + lollipopShapeSize / 3.5}
                                cy={orientation === 'horizontal' ? 0 + lollipopBarWidth / 2 : bar.y}
                                r={lollipopShapeSize / 2}
                                fill={barColor}
                                key={`circle--${bar.index}`}
                                data-tip={tooltip}
                                data-for={`cdc-open-viz-tooltip-${config.runtime.uniqueId}`}
                                style={{ filter: 'unset', opacity: 1 }}
                              />
                            )}
                            {config.isLollipopChart && config.lollipopShape === 'square' && (
                              <rect
                                x={orientation === 'horizontal' && bar.y > 10 ? bar.y - lollipopShapeSize / 2 : orientation === 'horizontal' && bar.y < 10 ? 0 : orientation !== 'horizontal' ? offset - lollipopBarWidth / 2 : barWidth * (barGroup.bars.length - bar.index - 1) + offset - 5.25}
                                y={orientation === 'horizontal' ? 0 - lollipopBarWidth / 2 : barY}
                                width={lollipopShapeSize}
                                height={lollipopShapeSize}
                                fill={barColor}
                                key={`circle--${bar.index}`}
                                data-tip={tooltip}
                                data-for={`cdc-open-viz-tooltip-${config.runtime.uniqueId}`}
                                style={{ opacity: 1, filter: 'unset' }}
                              >
                                <animate attributeName='height' values={`0, ${lollipopShapeSize}`} dur='2.5s' />
                              </rect>
                            )}
                          </Group>
                        </>
                      )
                    })}
                  </Group>
                ))
              }}
            </BarGroup>

            {Object.keys(config.confidenceKeys).length > 0
              ? data.map(d => {
                  let xPos = xScale(getXAxisData(d))
                  let upperPos = yScale(getYAxisData(d, config.confidenceKeys.lower))
                  let lowerPos = yScale(getYAxisData(d, config.confidenceKeys.upper))
                  let tickWidth = 5

                  return (
                    <path
                      key={`confidence-interval-${d[config.runtime.originalXAxis.dataKey]}`}
                      stroke='#333'
                      strokeWidth='2px'
                      d={`
                  M${xPos - tickWidth} ${upperPos}
                  L${xPos + tickWidth} ${upperPos}
                  M${xPos} ${upperPos}
                  L${xPos} ${lowerPos}
                  M${xPos - tickWidth} ${lowerPos}
                  L${xPos + tickWidth} ${lowerPos}`}
                    />
                  )
                })
              : ''}
          </Group>
        )}
      </Group>
    </ErrorBoundary>
  )
}
