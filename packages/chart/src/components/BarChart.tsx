import React, { useContext, useState, useEffect } from 'react';

import { Group } from '@visx/group';
import { BarGroup, BarStack } from '@visx/shape';
import { Text } from '@visx/text';
import chroma from 'chroma-js';

import ErrorBoundary from '@cdc/core/components/ErrorBoundary';

import Context from '../context';
import ReactTooltip from 'react-tooltip';

export default function BarChart({ xScale, yScale, seriesScale, xMax, yMax, getXAxisData, getYAxisData }) {
  const { transformedData: data, colorScale, seriesHighlight, config, formatNumber, updateConfig, setParentConfig } = useContext<any>(Context);
  const { visualizationSubType } = config;

  const lollipopBarWidth = 5;
  const lollipopShapeSize = 10;

  const isLabelBelowBar = config.yAxis.labelPlacement === "Below Bar";
  const isLabelOnYAxis = config.yAxis.labelPlacement === "On Y-Axis";
  const isLabelOnBar = config.yAxis.labelPlacement === "On Bar";
  const isLabelMissing = !config.yAxis.labelPlacement;
  const displayNumbersOnBar = config.yAxis.displayNumbersOnBar;

  // Using State
  const [horizBarHeight, setHorizBarHeight] = useState(null);
  const [textWidth, setTextWidth] = useState(null);

  useEffect(() => {
    if(config.visualizationSubType === "horizontal" && !config.yAxis.labelPlacement) {
      updateConfig({
        ...config,
        yAxis: {
          ...config,
          labelPlacement: "Below Bar"
        }
      })
    }
  }, [config, updateConfig]);

  return (
    <ErrorBoundary component="BarChart">
      <Group left={config.runtime.yAxis.size}>
        { config.visualizationSubType === 'stacked' ? (
          <BarStack
            data={data}
            keys={(config.runtime.barSeriesKeys || config.runtime.seriesKeys)}
            x={(d: any) => d[config.runtime.xAxis.dataKey]}
            xScale={xScale}
            yScale={yScale}
            color={colorScale}
          >
            {barStacks => barStacks.reverse().map(barStack => barStack.bars.map(bar => {
              let yAxisTooltip = config.runtime.yAxis.label ? `${config.runtime.yAxis.label}: ${formatNumber(bar.bar ? bar.bar.data[bar.key] : 0)}` : formatNumber(bar.bar ? bar.bar.data[bar.key] : 0)
              let xAxisTooltip = config.runtime.xAxis.label ? `${config.runtime.xAxis.label}: ${data[bar.index][config.runtime.xAxis.dataKey]}` : data[bar.index][config.runtime.xAxis.dataKey]

              const tooltip = `<div>
              ${yAxisTooltip}<br />
              ${xAxisTooltip}<br />
              ${config.seriesLabel ? `${config.seriesLabel}: ${bar.key}` : ''}`

              let transparentBar = config.legend.behavior === 'highlight' && seriesHighlight.length > 0 && seriesHighlight.indexOf(bar.key) === -1;
              let displayBar = config.legend.behavior === 'highlight' || seriesHighlight.length === 0 || seriesHighlight.indexOf(bar.key) !== -1;
              let barThickness = xMax / barStack.bars.length;
              let barThicknessAdjusted = barThickness * (config.barThickness || 0.8);
              let offset = barThickness * (1 - (config.barThickness || 0.8)) / 2;
              return (
              <Group key={`bar-stack-${barStack.index}-${bar.index}`}>
              <Text
                display={config.labels && displayBar ? 'block' : 'none'}
                opacity={transparentBar ? 0.5 : 1}
                x={barThickness * (bar.index + 0.5) + offset}
                y={bar.y - 5}
                fill={bar.color}
                textAnchor="middle">
                  {formatNumber(bar.bar ? bar.bar.data[bar.key] : 0)}
              </Text>
                <rect
                  key={`bar-stack-${barStack.index}-${bar.index}`}
                  x={barThickness * bar.index + offset}
                  y={bar.y}
                  height={bar.height}
                  width={barThicknessAdjusted}
                  fill={bar.color}
                  stroke="#333"
                  strokeWidth={config.barBorderThickness || 1}
                  opacity={transparentBar ? 0.5 : 1}
                  display={displayBar ? 'block' : 'none'}
                  data-tip={tooltip}
                  data-for={`cdc-open-viz-tooltip-${config.runtime.uniqueId}`}
                />
              </Group>
            )}
            ))
            }
          </BarStack>
        ) : (
          <Group>
            <BarGroup
              data={data}
              keys={(config.runtime.barSeriesKeys || config.runtime.seriesKeys)}
              height={yMax}
              x0={(d: any) => d[config.runtime.originalXAxis.dataKey]}
              x0Scale={config.runtime.horizontal ? yScale : xScale}
              x1Scale={seriesScale}
              yScale={config.runtime.horizontal ? xScale : yScale}
              color={() => {return '';}}
            >
              {(barGroups) => {

                if (config.visualizationSubType === "horizontal") {
                  const barsPerGroup = config.series.length;
                  let barHeight = config.barHeight ? config.barHeight : 25;
                  let barPadding = barHeight;

                  if(isLabelBelowBar || isLabelMissing || isLabelOnYAxis) {
                    if(barHeight < 40) {
                      config.barPadding = 40;
                    } else {
                      config.barPadding = barPadding;
                    }
                  } else {
                    config.barPadding = barPadding / 2;
                  }
                  config.barHeight = config.isLollipopChart ? lollipopBarWidth : barHeight;
                  config.height = (barsPerGroup * barHeight) * barGroups.length + (config.barPadding * barGroups.length);
                }

                return barGroups.map((barGroup, index) => (
                <Group key={`bar-group-${barGroup.index}-${barGroup.x0}--${index}`} top={config.runtime.horizontal ? yMax / barGroups.length * barGroup.index : 0} left={config.runtime.horizontal ? 0 : xMax / barGroups.length * barGroup.index}>
                  {barGroup.bars.map((bar,index) => {

                    let transparentBar = config.legend.behavior === 'highlight' && seriesHighlight.length > 0 && seriesHighlight.indexOf(bar.key) === -1;
                    let displayBar = config.legend.behavior === 'highlight' || seriesHighlight.length === 0 || seriesHighlight.indexOf(bar.key) !== -1;
                    let barHeight = config.visualizationSubType === "horizontal" ? config.barHeight : Math.abs(yScale(bar.value) - yScale(0));
                    let barY = bar.value >= 0 ? bar.y : yScale(0);
                    let barGroupWidth = (config.runtime.horizontal ? yMax : xMax) / barGroups.length * (config.barThickness || 0.8);
                    let offset = (config.runtime.horizontal ? yMax : xMax) / barGroups.length * (1 - (config.barThickness || 0.8)) / 2;

                    if(config.isLollipopChart) {
                      offset = ( (config.runtime.horizontal ? yMax : xMax) / barGroups.length / 2) - lollipopBarWidth / 2
                    }

                    let barWidth = config.isLollipopChart ? lollipopBarWidth : barGroupWidth / barGroup.bars.length;
                    let barColor = config.runtime.seriesLabels && config.runtime.seriesLabels[bar.key] ? colorScale(config.runtime.seriesLabels[bar.key]) : colorScale(bar.key);

                    let yAxisValue = formatNumber(bar.value);
                    let xAxisValue = data[barGroup.index][config.runtime.originalXAxis.dataKey];

                    if(config.runtime.horizontal){
                      let tempValue = yAxisValue;
                      yAxisValue = xAxisValue;
                      xAxisValue = tempValue;
                      barWidth = config.barHeight
                    }

                    let yAxisTooltip = config.runtime.yAxis.label ? `${config.runtime.yAxis.label}: ${yAxisValue}` : yAxisValue
                    let xAxisTooltip = config.runtime.xAxis.label ? `${config.runtime.xAxis.label}: ${xAxisValue}` : xAxisValue
                    let horizBarLabelPadding = null;
                    let labelColor = "#000000";

                    // Set label color
                    if (chroma.contrast(labelColor, barColor) < 4.9) {
                      labelColor = '#FFFFFF';
                    }

                    // font size and text spacing used for centering text on bar
                    if(config.fontSize === "small") {
                      horizBarLabelPadding = 16;
                    } else if(config.fontSize === "medium") {
                      horizBarLabelPadding = 18;
                    } else{
                      horizBarLabelPadding = 20;
                    }
                    const onBarTextSpacing = 25;
                    const tooltip = `<div>
                    ${yAxisTooltip}<br />
                    ${xAxisTooltip}<br />
                    ${config.seriesLabel ? `${config.seriesLabel}: ${bar.key}` : ''}`

                    return (
                    <Group key={`bar-sub-group-${barGroup.index}-${barGroup.x0}-${barY}--${index}`}>
                      <Text
                        display={config.labels && displayBar ? 'block' : 'none'}
                        opacity={transparentBar ? 0.5 : 1}
                        x={barWidth * (barGroup.bars.length - bar.index - 0.5) + offset}
                        y={barY - 5}
                        fill={barColor}
                        textAnchor="middle">
                          {formatNumber(bar.value)}
                      </Text>
                      <rect
                        key={`bar-group-bar-${barGroup.index}-${bar.index}-${bar.value}-${bar.key}`}
                        x={ config.runtime.horizontal ? 0 : barWidth * (barGroup.bars.length - bar.index - 1) + offset }
                        y={config.runtime.horizontal ? barWidth * (barGroup.bars.length - bar.index - 1) : barY}
                        width={config.runtime.horizontal ?  bar.y : barWidth}
                        height={config.runtime.horizontal ? barWidth : barHeight}
                        fill={barColor}
                        stroke="#333"
                        strokeWidth={config.isLollipopChart ? 0 : config.barBorderThickness || 1}
                        style={{fill: barColor}}
                        opacity={transparentBar ? 0.5 : 1}
                        display={displayBar ? 'block' : 'none'}
                        data-tip={tooltip}
                        data-for={`cdc-open-viz-tooltip-${config.runtime.uniqueId}`}
                      />
                      {config.isLollipopChart && config.lollipopShape === 'circle' &&
                        <circle 
                          cx={config.visualizationSubType === 'horizontal' ? bar.y : barWidth * (barGroup.bars.length - bar.index - 1) + offset + lollipopShapeSize/3.5}
                          cy={config.visualizationSubType === 'horizontal' ? lollipopShapeSize/3.5 : bar.y}
                          r={lollipopShapeSize} 
                          fill={barColor} 
                          key={`circle--${bar.index}`} 
                          style={{ 'opacity': 1, filter: 'unset' }}
                        />
                      }
                      {config.isLollipopChart && config.lollipopShape === 'square' &&
                        <rect 
                          x={config.visualizationSubType === 'horizontal' ? bar.y - 10 : barWidth * (barGroup.bars.length - bar.index - 1) + offset - 5.25}
                          y={config.visualizationSubType === 'horizontal' ? lollipopShapeSize - 15.25 : bar.y - 1}
                          width={lollipopShapeSize * 1.5 }
                          height={lollipopShapeSize * 1.5 }
                          fill={barColor} 
                          key={`circle--${bar.index}`} 
                          style={{ 'opacity': 1, filter: 'unset' }}
                        />
                      }
                      {visualizationSubType === "horizontal" && textWidth + 100 < bar.y ?
                        config.yAxis.labelPlacement === "On Bar" &&
                          <Group>
                              <Text
                                innerRef={
                                  (e) => {
                                    if(e) {
                                      // use font sizes and padding to set the bar height
                                      let elem = e.getBBox()
                                        setTextWidth(elem.width)
                                        config.barHeight = ( (elem.height * 2) + (horizBarLabelPadding * 2) + onBarTextSpacing / 2 )
                                        config.barPadding = ( horizBarHeight / 2 )
                                    }
                                  }
                                }
                                x={ bar.y - horizBarLabelPadding }
                                y={ barHeight * (barGroup.bars.length - bar.index - 1) + ( horizBarLabelPadding * 2 ) }
                                fill={ labelColor }
                                textAnchor="end"
                              >
                                { yAxisValue }
                              </Text>
                              <Text
                                x={ bar.y - horizBarLabelPadding }
                                y={ barWidth * (barGroup.bars.length - bar.index - 1) + ( horizBarLabelPadding * 2 ) + onBarTextSpacing }
                                fill={ labelColor }
                                textAnchor="end"
                              >
                                { xAxisValue }
                              </Text>
                          </Group>
                        :
                        (isLabelOnBar) &&
                          <Group>
                              {/* hide y label if we're only showing data on bar */}
                              <Text
                                  x={ bar.y + horizBarLabelPadding }
                                  y={ barWidth * (barGroup.bars.length - bar.index - 1) + ( horizBarLabelPadding * 2 ) }
                                  fill={ "#000" }
                                  textAnchor="start"
                                  verticalAnchor="end"
                                >{yAxisValue}</Text>
                              <Text
                                  x={ bar.y + horizBarLabelPadding }
                                  y={ barWidth * (barGroup.bars.length - bar.index - 1) + ( horizBarLabelPadding * 2 ) + onBarTextSpacing }
                                  fill={ "#000" }
                                  textAnchor="start"
                                  verticalAnchor="start"
                                >
                                  { xAxisValue }
                                </Text>
                          </Group>
                      }

                      { config.visualizationSubType === "horizontal" && isLabelBelowBar &&
                      <>
                        <Text
                            x={ 0 } // padding
                            y={ config.isLollipopChart ? lollipopShapeSize * config.series.length +7 : barWidth * config.series.length + 7 }
                            verticalAnchor={"start"}
                            textAnchor={"start"}
                          >{yAxisValue}
                        </Text>

                        { (displayNumbersOnBar || config.isLollipopChart) ?
                           (textWidth + 100 < bar.y && !config.isLollipopChart) ?
                            (
                                <Text
                                  x={ bar.y - 5 } // padding
                                  y={ config.barHeight * (barGroup.bars.length - bar.index - 1) + (config.barHeight / 2 ) }
                                  fill={ labelColor }
                                  textAnchor="end"
                                  verticalAnchor="middle"
                                >
                                  { xAxisValue }
                                </Text>
                            )
                            : (
                                <Text
                                  x={ `${bar.y + (config.isLollipopChart ? 15 : 5)}`} // padding
                                  y={ config.barHeight * (barGroup.bars.length - bar.index - 1) + (config.barHeight / 2 ) }
                                  fill={ barColor ? barColor : '#000'}
                                  textAnchor="start"
                                  verticalAnchor="middle"
                                  fontWeight={config.isLollipopChart ? '600' : 'normal'}
                                >
                                  { xAxisValue }
                                </Text>
                            )
                          : ""
                        }
                      </>
                      }

                      { (isLabelOnYAxis && visualizationSubType === "horizontal") &&
                        <>
                          { displayNumbersOnBar ?
                            (textWidth + 100 < bar.y) ?
                              (
                                  <Text
                                    x={ bar.y - 5 } // padding
                                    y={ config.barHeight * (barGroup.bars.length - bar.index - 1) + (config.barHeight / 2 )}
                                    fill={ labelColor }
                                    textAnchor="end"
                                    verticalAnchor="middle"
                                  >
                                    { xAxisValue }
                                  </Text>
                              )
                              : (
                                  <Text
                                    x={ bar.y + 5} // padding
                                    y={ config.barHeight * (barGroup.bars.length - bar.index - 1) + (config.barHeight / 2 )}
                                    fill={ '#000000' }
                                    textAnchor="start"
                                    verticalAnchor="middle"
                                  >
                                    { xAxisValue }
                                  </Text>
                              )
                            : ""
                          }
                          </>
                          }
                    </Group>
                  )}
                  )}
                </Group>
                  ))}}
            </BarGroup>

            {Object.keys(config.confidenceKeys).length > 0 ? data.map((d) => {
              let xPos = xScale(getXAxisData(d));
              let upperPos = yScale(getYAxisData(d, config.confidenceKeys.lower));
              let lowerPos = yScale(getYAxisData(d, config.confidenceKeys.upper));
              let tickWidth = 5;

              return (
                <path key={`confidence-interval-${d[config.runtime.originalXAxis.dataKey]}`} stroke="#333" strokeWidth="2px" d={`
                  M${xPos - tickWidth} ${upperPos}
                  L${xPos + tickWidth} ${upperPos}
                  M${xPos} ${upperPos}
                  L${xPos} ${lowerPos}
                  M${xPos - tickWidth} ${lowerPos}
                  L${xPos + tickWidth} ${lowerPos}`}/>
              );
            }) : ''}
          </Group>
        )}
      </Group>
    </ErrorBoundary>
  );
}
